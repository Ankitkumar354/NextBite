const express = require("express");
const router = express.Router();
const DeliveryLocation = require("../models/DeliveryLocation");
const FoodRequest = require("../models/FoodRequest");
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

// DELIVERY DASHBOARD
router.get(
    "/",
    requireAuth,
    requireRole("delivery"),
    getDashboard
);

// MARK AS PICKED UP
router.post(
    "/:id/pickup",
    requireAuth,
    requireRole("delivery"),
    pickupFood
);

// START DELIVERY
router.post(
    "/:id/start",
    requireAuth,
    requireRole("delivery"),
    startDelivery
);

// MARK AS DELIVERED
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

// UPDATE DELIVERY PERSON LOCATION
router.post(
    "/location",
    requireAuth,
    requireRole("delivery"),
    async (req, res) => {
        try {
            const latitude = Number(req.body.latitude);
            const longitude = Number(req.body.longitude);

            if (
                !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
                latitude < -90 || latitude > 90 ||
                longitude < -180 || longitude > 180
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid latitude and longitude are required"
                });
            }
            const hasActiveDelivery = await FoodRequest.exists({
                deliveryPerson: req.user._id,
                status: { $in: ["assigned", "picked_up", "in_transit"] }
            });

            if (!hasActiveDelivery) {
                return res.status(409).json({
                    success: false,
                    message: "No active delivery"
                });
            }
            const location = await DeliveryLocation.findOneAndUpdate(
                { deliveryPerson: req.user._id },
                {
                    latitude,
                    longitude,
                    updatedAt: new Date()
                },
                { new: true, upsert: true, runValidators: true }
            );

            res.status(200).json({
                success: true,
                message: "Location updated successfully",
                location
            });

        } catch (error) {
            console.error("Location update error:", error);

            res.status(500).json({
                success: false,
                message: "Failed to update location"
            });
        }
    }
);

// ========================================
// GET CURRENT DELIVERY LOCATION
// ========================================

router.get(
    "/location",
    requireAuth,
    async (req, res) => {
        try {
            const location = await DeliveryLocation.findOne({
                deliveryPerson: req.user._id
            });

            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: "Location not found"
                });
            }

            res.status(200).json({
                success: true,
                location
            });

        } catch (error) {
            console.error("Get location error:", error);

            res.status(500).json({
                success: false,
                message: "Failed to get location"
            });
        }
    }
);

module.exports = router;