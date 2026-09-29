const FoodRequest = require("../models/FoodRequest");
const Notification = require("../models/Notification");

// ========================================
// DELIVERY DASHBOARD
// ========================================

const getDashboard = async (req, res) => {
try {
    const deliveries = await FoodRequest
        .find({
            deliveryPerson: req.user._id,
            status: {
                $in: [
                    "assigned",
                    "picked_up",
                    "in_transit"
                ]
            }
        })
        .populate({
            path: "surplusFood",
            populate: {
                path: "kitchen",
                select: "name organizationName city"
            }
        })
        .populate(
            "ngo",
            "name organizationName city"
        )
        .sort({
            assignedAt: -1
        });


    const completedDeliveries =
        await FoodRequest.countDocuments({
            deliveryPerson: req.user._id,
            status: "delivered"
        });


    res.render("delivery/dashboard", {
        title: "Delivery Dashboard",
        user: req.user,
        deliveries,
        completedDeliveries
    });


} catch (error) {

    console.error(
        "Delivery dashboard error:",
        error.message
    );

    res.status(500).send(
        "Unable to load delivery dashboard."
    );
}


};

// ========================================
// PICKUP FOOD
// ========================================

const pickupFood = async (req, res) => {


try {

    const request = await FoodRequest
        .findOne({
            _id: req.params.id,
            deliveryPerson: req.user._id
        })
        .populate("surplusFood", "foodName unit")
        .populate("ngo", "name organizationName");


    if (!request) {

        return res.status(404).send(
            "Delivery request not found."
        );
    }


    if (request.status !== "assigned") {

        return res.status(400).send(
            "This delivery cannot be picked up."
        );
    }


    request.status = "picked_up";
    request.pickedUpAt = new Date();

    await request.save();


    // ========================================
    // NOTIFY NGO
    // ========================================

    await Notification.create({

        recipient: request.ngo._id,

        type: "food_picked_up",

        title: "Food Picked Up",

        message:
            `Your requested ${request.quantityRequested} ` +
            `${request.surplusFood?.unit || ""} of ` +
            `${request.surplusFood?.foodName || "food"} ` +
            `has been picked up by the delivery person.`,

        relatedRequest: request._id,

        relatedSurplus:
            request.surplusFood?._id || null

    });


    res.redirect("/dashboard/delivery");


} catch (error) {

    console.error(
        "Pickup error:",
        error.message
    );

    res.status(500).send(
        "Unable to update pickup status."
    );
}


};

// ========================================
// START DELIVERY
// ========================================

const startDelivery = async (req, res) => {


try {

    const request = await FoodRequest
        .findOne({
            _id: req.params.id,
            deliveryPerson: req.user._id
        })
        .populate("surplusFood", "foodName unit")
        .populate("ngo", "name organizationName");


    if (!request) {

        return res.status(404).send(
            "Delivery request not found."
        );
    }


    if (request.status !== "picked_up") {

        return res.status(400).send(
            "Food must be picked up first."
        );
    }


    request.status = "in_transit";

    await request.save();


    // ========================================
    // NOTIFY NGO
    // ========================================

    await Notification.create({

        recipient: request.ngo._id,

        type: "food_in_transit",

        title: "Food Delivery In Transit",

        message:
            `Your requested ${request.quantityRequested} ` +
            `${request.surplusFood?.unit || ""} of ` +
            `${request.surplusFood?.foodName || "food"} ` +
            `is now in transit.`,

        relatedRequest: request._id,

        relatedSurplus:
            request.surplusFood?._id || null

    });


    res.redirect("/dashboard/delivery");


} catch (error) {

    console.error(
        "Start delivery error:",
        error.message
    );

    res.status(500).send(
        "Unable to start delivery."
    );
}


};

// ========================================
// COMPLETE DELIVERY
// ========================================

const completeDelivery = async (req, res) => {


try {

    const request = await FoodRequest
        .findOne({
            _id: req.params.id,
            deliveryPerson: req.user._id
        })
        .populate("surplusFood", "foodName unit")
        .populate("ngo", "name organizationName");


    if (!request) {

        return res.status(404).send(
            "Delivery request not found."
        );
    }


    if (request.status !== "in_transit") {

        return res.status(400).send(
            "This delivery is not in transit."
        );
    }


    request.status = "delivered";

    request.deliveredAt = new Date();

    await request.save();


    // ========================================
    // NOTIFY NGO
    // ========================================

    await Notification.create({

        recipient: request.ngo._id,

        type: "food_delivered",

        title: "Food Delivered",

        message:
            `Your requested ${request.quantityRequested} ` +
            `${request.surplusFood?.unit || ""} of ` +
            `${request.surplusFood?.foodName || "food"} ` +
            `has been successfully delivered.`,

        relatedRequest: request._id,

        relatedSurplus:
            request.surplusFood?._id || null

    });


    res.redirect("/dashboard/delivery");


} catch (error) {

    console.error(
        "Complete delivery error:",
        error.message
    );

    res.status(500).send(
        "Unable to complete delivery."
    );
}


};

// ========================================
// GENERIC DELIVERY STATUS UPDATE
// ========================================

const updateDeliveryStatus = async (req, res) => {

try {

    const { status } = req.body;

    const allowedStatuses = [
        "picked_up",
        "in_transit",
        "delivered"
    ];


    if (!allowedStatuses.includes(status)) {

        return res.status(400).send(
            "Invalid delivery status."
        );

    }


    const request = await FoodRequest
        .findOne({
            _id: req.params.id,
            deliveryPerson: req.user._id
        })
        .populate("surplusFood", "foodName unit")
        .populate("ngo", "name organizationName");


    if (!request) {

        return res.status(404).send(
            "Delivery request not found."
        );

    }


    // ========================================
    // STATUS TRANSITION VALIDATION
    // ========================================

    if (
        status === "picked_up" &&
        request.status !== "assigned"
    ) {

        return res.status(400).send(
            "Food must be assigned before pickup."
        );

    }


    if (
        status === "in_transit" &&
        request.status !== "picked_up"
    ) {

        return res.status(400).send(
            "Food must be picked up first."
        );

    }


    if (
        status === "delivered" &&
        request.status !== "in_transit"
    ) {

        return res.status(400).send(
            "Food must be in transit before delivery."
        );

    }


    // ========================================
    // UPDATE STATUS
    // ========================================

    request.status = status;


    if (status === "picked_up") {

        request.pickedUpAt = new Date();

    }


    if (status === "delivered") {

        request.deliveredAt = new Date();

    }


    await request.save();


    // ========================================
    // NOTIFICATION
    // ========================================

    let notificationData = null;


    if (status === "picked_up") {

        notificationData = {

            recipient: request.ngo._id,

            type: "food_picked_up",

            title: "Food Picked Up",

            message:
                `Your requested ${request.quantityRequested} ` +
                `${request.surplusFood?.unit || ""} of ` +
                `${request.surplusFood?.foodName || "food"} ` +
                `has been picked up.`,

            relatedRequest: request._id,

            relatedSurplus:
                request.surplusFood?._id || null

        };

    }


    if (status === "in_transit") {

        notificationData = {

            recipient: request.ngo._id,

            type: "food_in_transit",

            title: "Food In Transit",

            message:
                `Your requested ${request.quantityRequested} ` +
                `${request.surplusFood?.unit || ""} of ` +
                `${request.surplusFood?.foodName || "food"} ` +
                `is now in transit.`,

            relatedRequest: request._id,

            relatedSurplus:
                request.surplusFood?._id || null

        };

    }


    if (status === "delivered") {

        notificationData = {

            recipient: request.ngo._id,

            type: "food_delivered",

            title: "Food Delivered",

            message:
                `Your requested ${request.quantityRequested} ` +
                `${request.surplusFood?.unit || ""} of ` +
                `${request.surplusFood?.foodName || "food"} ` +
                `has been successfully delivered.`,

            relatedRequest: request._id,

            relatedSurplus:
                request.surplusFood?._id || null

        };

    }


    if (notificationData) {

        await Notification.create(
            notificationData
        );

    }


    res.redirect(
        "/dashboard/delivery"
    );

} catch (error) {

    console.error(
        "Delivery status error:",
        error
    );

    res.status(500).send(
        "Unable to update delivery status."
    );

}

};

module.exports = {
getDashboard,
pickupFood,
startDelivery,
completeDelivery,
updateDeliveryStatus
};
