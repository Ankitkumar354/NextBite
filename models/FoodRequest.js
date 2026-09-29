const mongoose = require("mongoose");

const foodRequestSchema = new mongoose.Schema(
    {
        // ================================
        // NGO
        // ================================
        ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ================================
        // SURPLUS FOOD
        // ================================
        surplusFood: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SurplusFood",
            required: true
        },

        // ================================
        // REQUESTED QUANTITY
        // ================================
        quantityRequested: {
            type: Number,
            required: true,
            min: 1
        },

        // ================================
        // NGO MESSAGE
        // ================================
        message: {
            type: String,
            trim: true,
            default: ""
        },

        // ================================
        // IMAGE
        // ================================
        image: {
            url: {
                type: String,
                default: ""
            },
            filename: {
                type: String,
                default: ""
            }
        },

        // ================================
        // REQUEST STATUS
        // ================================
        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "assigned",
                "picked_up",
                "in_transit",
                "delivered",
                "rejected",
                "cancelled"
            ],
            default: "pending"
        },

        // ================================
        // REQUEST DATE
        // ================================
        requestedAt: {
            type: Date,
            default: Date.now
        },

        // ================================
        // DELIVERY PERSON
        // ================================
        deliveryPerson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // ================================
        // DELIVERY ASSIGNED DATE
        // ================================
        assignedAt: {
            type: Date,
            default: null
        },

        // ================================
        // PICKED UP DATE
        // ================================
        pickedUpAt: {
            type: Date,
            default: null
        },

        // ================================
        // DELIVERED DATE
        // ================================
        deliveredAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "FoodRequest",
    foodRequestSchema
);