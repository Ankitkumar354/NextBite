const mongoose = require("mongoose");

const foodConsumptionSchema = new mongoose.Schema(
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
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        expectedCustomers: {
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
            required: true,
            min: 0
        },

        unit: {
            type: String,
            enum: [
                "plates",
                "kg",
                "litres",
                "units"
            ],
            default: "plates"
        },

        leftoverQuantity: {
            type: Number,
            default: 0,
            min: 0
        },

        specialEvent: {
            type: Boolean,
            default: false
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


// ========================================
// CALCULATE LEFTOVER FOOD
// ========================================

foodConsumptionSchema.pre("validate", function () {

    this.leftoverQuantity = Math.max(
        0,
        this.preparedQuantity - this.consumedQuantity
    );

});


module.exports = mongoose.model(
    "FoodConsumption",
    foodConsumptionSchema
);