const mongoose = require("mongoose");

const impactCertificateSchema = new mongoose.Schema(
    {
        kitchen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Public verify ke liye unique ID, jaise NB-2026-A1B2C3D4
        certificateId: {
            type: String,
            required: true,
            unique: true
        },

        periodStart: { type: Date, required: true },
        periodEnd: { type: Date, required: true },

        deliveries: { type: Number, required: true },
        foodKg: { type: Number, required: true },
        co2eKg: { type: Number, required: true },

        breakdown: [
            {
                unit: String,
                quantity: Number
            }
        ],

        // Us waqt ke factors ka snapshot, taaki baad mein config badle to
        // purana certificate na badle
        factors: {
            co2ePerKgFood: Number,
            kgPerUnit: Object
        },

        issuedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ImpactCertificate", impactCertificateSchema);