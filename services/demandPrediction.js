const FoodConsumption =
    require("../models/FoodConsumption");


const predictDemand = async ({
    kitchenId,
    foodName,
    expectedCustomers,
    specialEvent = false
}) => {

    const records =
        await FoodConsumption
            .find({
                kitchen: kitchenId,
                foodName: {
                    $regex: `^${foodName}$`,
                    $options: "i"
                }
            })
            .sort({
                date: -1
            })
            .limit(30);


    // ========================================
    // NO HISTORY
    // ========================================

    if (records.length === 0) {

        return {
            hasHistory: false,
            historicalRecords: 0,
            predictedDemand: 0,
            recommendedPreparation: 0,
            expectedSurplus: 0,
            surplusRisk: "unknown",
            message:
                "Not enough historical data."
        };

    }


    // ========================================
    // AVERAGE CONSUMPTION
    // ========================================

    const totalConsumed =
        records.reduce(
            (sum, record) =>
                sum + record.consumedQuantity,
            0
        );


    const averageConsumption =
        totalConsumed / records.length;


    // ========================================
    // RECENT CONSUMPTION
    // ========================================

    const recentRecords =
        records.slice(0, 7);


    const recentTotal =
        recentRecords.reduce(
            (sum, record) =>
                sum + record.consumedQuantity,
            0
        );


    const recentAverage =
        recentTotal / recentRecords.length;


    // ========================================
    // BASE DEMAND
    // ========================================

    let predictedDemand =
        (averageConsumption * 0.4) +
        (recentAverage * 0.6);


    // ========================================
    // CUSTOMER ADJUSTMENT
    // ========================================

    const averageCustomers =
        records.reduce(
            (sum, record) =>
                sum + record.expectedCustomers,
            0
        ) / records.length;


    if (
        averageCustomers > 0 &&
        expectedCustomers > 0
    ) {

        const customerFactor =
            expectedCustomers /
            averageCustomers;


        predictedDemand *=
            customerFactor;

    }


    // ========================================
    // SPECIAL EVENT
    // ========================================

    if (specialEvent) {

        predictedDemand *= 1.10;

    }


    predictedDemand =
        Math.ceil(predictedDemand);


    // ========================================
    // PREPARATION BUFFER
    // ========================================

    const safetyBuffer = 1.05;


    const recommendedPreparation =
        Math.ceil(
            predictedDemand *
            safetyBuffer
        );


    // ========================================
    // EXPECTED SURPLUS
    // ========================================

    const expectedSurplus =
        Math.max(
            0,
            recommendedPreparation -
            predictedDemand
        );


    // ========================================
    // SURPLUS RISK
    // ========================================

    let surplusRisk = "low";


    const surplusPercentage =
        predictedDemand > 0
            ? (
                expectedSurplus /
                predictedDemand
            ) * 100
            : 0;


    if (surplusPercentage >= 20) {

        surplusRisk = "high";

    } else if (surplusPercentage >= 10) {

        surplusRisk = "medium";

    }


    // ========================================
    // RECOMMENDATION
    // ========================================

    let recommendation;


    if (surplusRisk === "high") {

        recommendation =
            "High surplus risk. Consider reducing production or preparing food in smaller batches.";

    } else if (surplusRisk === "medium") {

        recommendation =
            "Moderate surplus risk. Monitor consumption and avoid unnecessary overproduction.";

    } else {

        recommendation =
            "Low surplus risk. Recommended preparation is close to predicted demand.";

    }


    return {

        hasHistory: true,

        historicalRecords:
            records.length,

        averageConsumption:
            Math.round(
                averageConsumption * 10
            ) / 10,

        recentAverage:
            Math.round(
                recentAverage * 10
            ) / 10,

        predictedDemand,

        recommendedPreparation,

        expectedSurplus,

        surplusRisk,

        surplusPercentage:
            Math.round(
                surplusPercentage * 10
            ) / 10,

        recommendation

    };

};


module.exports = {
    predictDemand
};