const express = require("express");

const router = express.Router();

const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

const {
    getDashboard,
    createProductionRecord,
    getFoodRequests,
    approveFoodRequest,
    rejectFoodRequest
} = require("../controllers/kitchenController");

router.get(
    "/",
    requireAuth,
    requireRole("kitchen"),
    getDashboard
);


router.post(
    "/production",
    requireAuth,
    requireRole("kitchen"),
    createProductionRecord
);

// ===============================
// FOOD REQUESTS
// ===============================

router.get(
    "/requests",
    requireAuth,
    requireRole("kitchen"),
    getFoodRequests
);


// ===============================
// APPROVE
// ===============================

router.post(
    "/requests/:id/approve",
    requireAuth,
    requireRole("kitchen"),
    approveFoodRequest
);


// ===============================
// REJECT
// ===============================

router.post(
    "/requests/:id/reject",
    requireAuth,
    requireRole("kitchen"),
    rejectFoodRequest
);


module.exports = router;