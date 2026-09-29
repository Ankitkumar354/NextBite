const express = require("express");

const router = express.Router();

const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

const {
    showPredictionPage,
    addConsumptionData,
    generatePrediction,
    createSurplusPlan
} = require("../controllers/predictionController");

// ========================================
// PREDICTION PAGE
// ========================================

router.get(
    "/",
    requireAuth,
    requireRole("kitchen"),
    showPredictionPage
);


// ========================================
// ADD CONSUMPTION DATA
// ========================================

router.post(
    "/consumption",
    requireAuth,
    requireRole("kitchen"),
    addConsumptionData
);

// ========================================
// GENERATE PREDICTION
// ========================================

router.post(
    "/predict",
    requireAuth,
    requireRole("kitchen"),
    generatePrediction
);

router.post(
    "/surplus-plan",
    requireAuth,
    requireRole("kitchen"),
    createSurplusPlan
);

module.exports = router;