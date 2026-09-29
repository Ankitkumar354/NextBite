const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "food_request",
                "request_approved",
                "request_rejected",
                "delivery_assigned",
                "food_picked_up",
                "food_in_transit",
                "food_delivered",
                "surplus_published",
                "system"
            ],
            default: "system"
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        relatedRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FoodRequest",
            default: null
        },

        relatedSurplus: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SurplusFood",
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);