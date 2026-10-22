const FoodRequest = require("../models/FoodRequest");
const SurplusFood = require("../models/SurplusFood");
const { KG_PER_UNIT, CO2E_PER_KG_FOOD } = require("../config/impact");

const round = (n) => Math.round(n * 100) / 100;

exports.calculateImpact = async (kitchenId, from = null, to = null) => {

    // Is kitchen ke saare surplus listings
    const surplus = await SurplusFood
        .find({ kitchen: kitchenId })
        .select("_id unit")
        .lean();

    const unitById = new Map(surplus.map(s => [String(s._id), s.unit]));

    const filter = {
        surplusFood: { $in: [...unitById.keys()] },
        status: "delivered"
    };

    if (from || to) {
        filter.deliveredAt = {};
        if (from) filter.deliveredAt.$gte = from;
        if (to) filter.deliveredAt.$lte = to;
    }

    const delivered = await FoodRequest
        .find(filter)
        .select("surplusFood quantityRequested")
        .lean();

    let foodKg = 0;
    const quantityByUnit = {};

    delivered.forEach(request => {
        const unit = unitById.get(String(request.surplusFood));
        const qty = Number(request.quantityRequested) || 0;

        foodKg += qty * (KG_PER_UNIT[unit] ?? 0);
        quantityByUnit[unit] = (quantityByUnit[unit] || 0) + qty;
    });

    return {
        deliveries: delivered.length,
        foodKg: round(foodKg),
        co2eKg: round(foodKg * CO2E_PER_KG_FOOD),
        breakdown: Object.entries(quantityByUnit).map(
            ([unit, quantity]) => ({ unit, quantity })
        )
    };
};