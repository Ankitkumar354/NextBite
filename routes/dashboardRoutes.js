const express = require("express");

const router = express.Router();

const FoodRequest = require("../models/FoodRequest");
const DeliveryLocation = require("../models/DeliveryLocation");


const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

const {
    getDashboard: getNgoDashboard,
    createFoodRequest
} = require("../controllers/ngoController");

const {
    getDashboard: getAdminDashboard,
    getDeliveryAssignments,
    assignDelivery,
    getUsers,
    toggleUserStatus,
    getFoodRequests,
    getAnalytics,
    getCourierMap,
    getCourierLocations
} = require("../controllers/adminController");

router.get("/", requireAuth, (req, res) => {
    const role = req.user.role;
    if (role === "admin") {
        return res.redirect("/dashboard/admin");
    }
    if (role === "kitchen") {
        return res.redirect("/dashboard/kitchen");
    }
    if (role === "ngo") {
        return res.redirect("/dashboard/ngo");
    }
    if (role === "delivery") {
        return res.redirect("/dashboard/delivery");
    }
    if (role === "processing") {
        return res.redirect("/dashboard/processing");
    }
    return res.status(403).send("Invalid user role.");
});

router.get(
    "/ngo",
    requireAuth,
    requireRole("ngo"),
    getNgoDashboard
);

router.post(
    "/ngo/request/:id",
    requireAuth,
    requireRole("ngo"),
    createFoodRequest
);

router.get(
    "/processing",
    requireAuth,
    requireRole("processing"),
    async (req, res) => {

        res.render("processing/dashboard", {
            title: "Processing Dashboard",
            user: req.user
        });
    }
);

router.get(
    "/admin",
    requireAuth,
    requireRole("admin"),
    getAdminDashboard
);

router.get(
    "/admin/delivery-assignments",
    requireAuth,
    requireRole("admin"),
    getDeliveryAssignments
);

router.post(
    "/admin/delivery-assignments/:id",
    requireAuth,
    requireRole("admin"),
    assignDelivery
);

router.get(
    "/admin/users",
    requireAuth,
    requireRole("admin"),
    getUsers
);

router.post(
    "/admin/users/:id/toggle-status",
    requireAuth,
    requireRole("admin"),
    toggleUserStatus
);

router.get(
    "/admin/food-requests",
    requireAuth,
    requireRole("admin"),
    getFoodRequests
);

router.get(
    "/admin/analytics",
    requireAuth,
    requireRole("admin"),
    getAnalytics
);

router.get(
    "/admin/courier-map",
    requireAuth,
    requireRole("admin"),
    getCourierMap
);

router.get(
    "/admin/courier-locations",
    requireAuth,
    requireRole("admin"),
    getCourierLocations
);

router.get(
    "/ngo/track-delivery/:requestId",
    requireAuth,
    requireRole("ngo"),
    async (req, res) => {
        try {
            const { requestId } = req.params;


            // Find request belonging to the logged-in NGO
            const foodRequest = await FoodRequest.findOne({
                _id: requestId,
                ngo: req.user._id
            });

            if (!foodRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Food request not found"
                });
            }

            // Check delivery assignment
            if (!foodRequest.deliveryPerson) {
                return res.status(400).json({
                    success: false,
                    message: "No delivery person assigned yet"
                });
            }

            if (!["picked_up", "in_transit"].includes(foodRequest.status)) {
                return res.status(400).json({
                    success: false,
                    message: "Live tracking starts after pickup and ends after delivery"
                });
            }

            // Fetch NGO destination
            const User = require("../models/User");

            const ngo = await User.findById(req.user._id).select(
                "name organizationName address city latitude longitude"
            );

            if (!ngo) {
                return res.status(404).json({
                    success: false,
                    message: "NGO details not found"
                });
            }

            // Get delivery person's latest location
            const location = await DeliveryLocation.findOne({
                deliveryPerson: foodRequest.deliveryPerson
            });

            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: "Delivery location is not available yet"
                });
            }

            return res.status(200).json({
                success: true,
                requestId: foodRequest._id,
                status: foodRequest.status,

                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    updatedAt: location.updatedAt
                },

                destination: {
                    name: ngo.organizationName || ngo.name,
                    address: ngo.address || "",
                    city: ngo.city || "",
                    latitude: ngo.latitude,
                    longitude: ngo.longitude
                }
            });

        } catch (error) {
            console.error("NGO delivery tracking error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch delivery location"
            });
        }
    }


);

module.exports = router;