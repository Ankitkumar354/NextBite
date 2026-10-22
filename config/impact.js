// Ye sab ESTIMATES hain. Certificate par bhi yahi likha jayega.
module.exports = {
    // 1 unit kitne kg khana maana jaye
    KG_PER_UNIT: {
        kg: 1,
        litres: 1,
        plates: 0.4,    // ek plate/meal ~400 g (assumption)
        units: 0.25     // ek packet/piece ~250 g (assumption)
    },

    // Waste hone par ~2.5 kg CO2e per kg khana
    // (FAO "Food Wastage Footprint" ka average: ~3.3 Gt CO2e / ~1.3 Gt food)
    CO2E_PER_KG_FOOD: 2.5,

    METHOD_NOTE:
        "Estimated using average conversion factors (food weight and CO2e per kg of " +
        "food waste avoided). Actual emissions vary by food type and region."
};