const express = require("express");

const router = express.Router();

const {
    requireAuth
} = require("../middleware/authMiddleware");

const {
    getProfile,
    updateProfile
} = require("../controllers/profileController");


// ========================================
// VIEW PROFILE
// ========================================

router.get(
    "/",
    requireAuth,
    getProfile
);


// ========================================
// UPDATE PROFILE
// ========================================

router.post(
    "/update",
    requireAuth,
    updateProfile
);


module.exports = router;