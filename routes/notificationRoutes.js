const express = require("express");

const router = express.Router();

const {
    requireAuth
} = require("../middleware/authMiddleware");

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require("../controllers/notificationController");


// ========================================
// NOTIFICATIONS PAGE
// ========================================

router.get(
    "/",
    requireAuth,
    getNotifications
);


// ========================================
// MARK ONE AS READ
// ========================================

router.post(
    "/:id/read",
    requireAuth,
    markAsRead
);


// ========================================
// MARK ALL AS READ
// ========================================

router.post(
    "/read-all",
    requireAuth,
    markAllAsRead
);


// ========================================
// DELETE
// ========================================

router.post(
    "/:id/delete",
    requireAuth,
    deleteNotification
);


module.exports = router;