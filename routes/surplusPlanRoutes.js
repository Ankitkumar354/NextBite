const express = require("express");
const router = express.Router();

const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

const {
    getSurplusPlans,
    publishSurplusPlan
} = require("../controllers/surplusPlanController");

router.get(
    "/",
    requireAuth,
    requireRole("kitchen"),
    getSurplusPlans
);
router.post(
    "/:id/publish",
    requireAuth,
    requireRole("kitchen"),
    publishSurplusPlan
);

module.exports = router;