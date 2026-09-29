const mongoose = require("mongoose");

const surplusPlanSchema = new mongoose.Schema(
    {
        kitchen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        foodName: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "cooked_food",
                "raw_material",
                "bakery",
                "fruits_vegetables",
                "dairy",
                "other"
            ],
            default: "cooked_food"
        },

        plannedDate: {
            type: Date,
            required: true
        },

        expectedCustomers: {
            type: Number,
            required: true,
            min: 0
        },

        predictedDemand: {
            type: Number,
            required: true,
            min: 0
        },

        recommendedPreparation: {
            type: Number,
            required: true,
            min: 0
        },

        expectedSurplus: {
            type: Number,
            required: true,
            min: 0
        },

        surplusRisk: {
            type: String,
            enum: ["low", "medium", "high", "unknown"],
            default: "unknown"
        },

        unit: {
            type: String,
            enum: ["plates", "kg", "litres", "units"],
            default: "plates"
        },

        status: {
            type: String,
            enum: ["planned", "published", "cancelled"],
            default: "planned"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SurplusPlan", surplusPlanSchema);