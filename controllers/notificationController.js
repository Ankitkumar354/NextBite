const Notification = require("../models/Notification");


// ========================================
// GET NOTIFICATIONS
// ========================================

const getNotifications = async (req, res) => {
    try {

        const notifications = await Notification
            .find({
                recipient: req.user._id
            })
            .sort({
                createdAt: -1
            });

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.render("notifications/index", {
            title: "Notifications",
            user: req.user,
            notifications,
            unreadCount
        });

    } catch (error) {

        console.error(
            "Get notifications error:",
            error
        );

        res.status(500).send(
            "Unable to load notifications."
        );
    }
};


// ========================================
// MARK ONE AS READ
// ========================================

const markAsRead = async (req, res) => {
    try {

        const notification =
            await Notification.findOne({
                _id: req.params.id,
                recipient: req.user._id
            });

        if (!notification) {
            return res.status(404).send(
                "Notification not found."
            );
        }

        notification.isRead = true;
        notification.readAt = new Date();

        await notification.save();

        res.redirect("/notifications");

    } catch (error) {

        console.error(
            "Mark notification read error:",
            error
        );

        res.status(500).send(
            "Unable to update notification."
        );
    }
};


// ========================================
// MARK ALL AS READ
// ========================================

const markAllAsRead = async (req, res) => {
    try {

        await Notification.updateMany(
            {
                recipient: req.user._id,
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        res.redirect("/notifications");

    } catch (error) {

        console.error(
            "Mark all notifications read error:",
            error
        );

        res.status(500).send(
            "Unable to update notifications."
        );
    }
};


// ========================================
// DELETE NOTIFICATION
// ========================================

const deleteNotification = async (req, res) => {
    try {

        const notification =
            await Notification.findOneAndDelete({
                _id: req.params.id,
                recipient: req.user._id
            });

        if (!notification) {
            return res.status(404).send(
                "Notification not found."
            );
        }

        res.redirect("/notifications");

    } catch (error) {

        console.error(
            "Delete notification error:",
            error
        );

        res.status(500).send(
            "Unable to delete notification."
        );
    }
};


module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};