const express = require("express");

const router = express.Router();

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
    getAnalytics
} = require("../controllers/adminController");

// ===============================
// MAIN DASHBOARD REDIRECT
// ===============================

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


// ===============================
// NGO DASHBOARD
// ===============================

router.get(
    "/ngo",
    requireAuth,
    requireRole("ngo"),
    getNgoDashboard
);


// ===============================
// NGO FOOD REQUEST
// ===============================

router.post(
    "/ngo/request/:id",
    requireAuth,
    requireRole("ngo"),
    createFoodRequest
);


// ===============================
// DELIVERY DASHBOARD
// ===============================

// router.get(
//     "/delivery",
//     requireAuth,
//     requireRole("delivery"),
//     async (req, res) => {

//         res.render("delivery/dashboard", {
//             title: "Delivery Dashboard",
//             user: req.user
//         });

//     }
// );


// ===============================
// PROCESSING DASHBOARD
// ===============================

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


// ===============================
// ADMIN DASHBOARD
// ===============================

router.get(
    "/admin",
    requireAuth,
    requireRole("admin"),
    getAdminDashboard
);

// ========================================
// DELIVERY ASSIGNMENTS
// ========================================

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

// ========================================
// ADMIN → USERS
// ========================================

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
// ========================================
// ADMIN → FOOD REQUESTS
// ========================================

router.get(
    "/admin/food-requests",
    requireAuth,
    requireRole("admin"),
    getFoodRequests
);

// ========================================
// ADMIN → ANALYTICS
// ========================================

router.get(
    "/admin/analytics",
    requireAuth,
    requireRole("admin"),
    getAnalytics
);




module.exports = router;