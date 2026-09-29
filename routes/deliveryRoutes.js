const express = require("express");

const router = express.Router();

const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

const {
    getDashboard,
    pickupFood,
    startDelivery,
    completeDelivery,
    updateDeliveryStatus
} = require("../controllers/deliveryController");


// ========================================
// DELIVERY DASHBOARD
// ========================================

router.get(
    "/",
    requireAuth,
    requireRole("delivery"),
    getDashboard
);


// ========================================
// MARK AS PICKED UP
// ========================================

router.post(
    "/:id/pickup",
    requireAuth,
    requireRole("delivery"),
    pickupFood
);


// ========================================
// START DELIVERY
// ========================================

router.post(
    "/:id/start",
    requireAuth,
    requireRole("delivery"),
    startDelivery
);


// ========================================
// MARK AS DELIVERED
// ========================================

router.post(
    "/:id/complete",
    requireAuth,
    requireRole("delivery"),
    completeDelivery
);

router.post(
    "/:id/status",
    requireAuth,
    requireRole("delivery"),
    updateDeliveryStatus
);

module.exports = router;