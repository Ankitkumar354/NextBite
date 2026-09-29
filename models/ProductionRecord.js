const mongoose = require("mongoose");

const productionRecordSchema = new mongoose.Schema(
    {
        kitchen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        foodItem: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true,
            default: Date.now
        },

        expectedDemand: {
            type: Number,
            required: true,
            min: 0
        },

        preparedQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        consumedQuantity: {
            type: Number,
            default: 0,
            min: 0
        },

        surplusQuantity: {
            type: Number,
            default: 0,
            min: 0
        },

        wastedQuantity: {
            type: Number,
            default: 0,
            min: 0
        },

        unit: {
            type: String,
            default: "plates"
        },

        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ProductionRecord",
    productionRecordSchema
);