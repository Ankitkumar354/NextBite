const mongoose = require("mongoose");

const surplusFoodSchema = new mongoose.Schema(
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

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        unit: {
            type: String,
            enum: ["plates", "kg", "litres", "units"],
            default: "plates"
        },

        preparedAt: {
            type: Date,
            required: true
        },

        pickupDeadline: {
            type: Date,
            required: true
        },

        description: {
            type: String,
            trim: true
        },

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
        pickupAddress: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "available",
                "requested",
                "assigned",
                "picked_up",
                "completed",
                "expired",
                "cancelled"
            ],
            default: "available"
        },

            qualityStatus: { 
            type: String 
        },
        
        shelfLifeHours: { 
            type: Number 
        },
        
        aiConfidence: { 
            type: Number 
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "SurplusFood",
    surplusFoodSchema
);