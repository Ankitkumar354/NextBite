const FoodConsumption =
    require("../models/FoodConsumption");

    const {
    predictDemand
} = require("../services/demandPrediction");

const SurplusPlan = require("../models/SurplusPlan");


// ========================================
// SHOW PREDICTION PAGE
// ========================================

const showPredictionPage = async (req, res) => {

    try {

        const records =
            await FoodConsumption
                .find({
                    kitchen: req.user._id
                })
                .sort({
                    date: -1
                })
                .limit(20);


        res.render(
            "kitchen/prediction",
            {
                title: "Food Demand Prediction",
                user: req.user,
                records
            }
        );


    } catch (error) {

        console.error(
            "Prediction page error:",
            error
        );

        res.status(500).send(
            "Unable to load prediction page."
        );

    }

};


// ========================================
// ADD CONSUMPTION DATA
// ========================================

const addConsumptionData = async (req, res) => {

    try {

        const {
            foodName,
            category,
            date,
            expectedCustomers,
            preparedQuantity,
            consumedQuantity,
            unit,
            specialEvent,
            notes
        } = req.body;


        await FoodConsumption.create({

            kitchen: req.user._id,

            foodName,

            category,

            date,

            expectedCustomers,

            preparedQuantity,

            consumedQuantity,

            unit,

            specialEvent:
                specialEvent === "true" ||
                specialEvent === "on",

            notes

        });


        res.redirect(
            "/dashboard/kitchen/prediction"
        );


    } catch (error) {

        console.error(
            "Consumption data error:",
            error
        );

        res.status(500).send(
            "Unable to save consumption data."
        );

    }

};

// ========================================
// GENERATE DEMAND PREDICTION
// ========================================

const generatePrediction = async (req, res) => {

    try {

        const {
            foodName,
            expectedCustomers,
            specialEvent
        } = req.body;


        const prediction =
            await predictDemand({

                kitchenId: req.user._id,

                foodName,

                expectedCustomers:
                    Number(expectedCustomers),

                specialEvent:
                    specialEvent === "true"

            });


        res.render(
            "kitchen/prediction-result",
            {

                title:
                    "Demand Prediction Result",

                user:
                    req.user,

                foodName,

                expectedCustomers,

                prediction

            }
        );


    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        res.status(500).send(
            "Unable to generate prediction."
        );

    }

};

const createSurplusPlan = async (req, res) => {
    try {
        const {
            foodName,
            category,
            plannedDate,
            expectedCustomers,
            predictedDemand,
            recommendedPreparation,
            expectedSurplus,
            surplusRisk,
            unit
        } = req.body;

        if (!foodName || !plannedDate) {
            return res.status(400).send("Food name and planned date are required.");
        }

        await SurplusPlan.create({
            kitchen: req.user._id,
            foodName,
            category: category || "cooked_food",
            plannedDate,
            expectedCustomers: Number(expectedCustomers),
            predictedDemand: Number(predictedDemand),
            recommendedPreparation: Number(recommendedPreparation),
            expectedSurplus: Number(expectedSurplus),
            surplusRisk: surplusRisk || "unknown",
            unit: unit || "plates",
            status: "planned"
        });

        res.redirect("/dashboard/kitchen/prediction");
    } catch (error) {
        console.error("Create surplus plan error:", error);
        res.status(500).send("Unable to create surplus plan.");
    }
};


module.exports = {
    showPredictionPage,
    addConsumptionData,
    generatePrediction,
    createSurplusPlan
};