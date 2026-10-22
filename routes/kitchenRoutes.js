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

const {
    getImpactPage,
    createCertificate,
    viewCertificate
} = require("../controllers/impactController");

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

router.get("/impact", requireAuth, requireRole("kitchen"), getImpactPage);

router.post("/impact/certificates", requireAuth, requireRole("kitchen"), createCertificate);

router.get(
    "/impact/certificates/:certificateId",
    requireAuth,
    requireRole("kitchen"),
    viewCertificate
);


module.exports = router;