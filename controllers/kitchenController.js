const ProductionRecord = require("../models/ProductionRecord");
const FoodRequest = require("../models/FoodRequest");
const SurplusFood = require("../models/SurplusFood");
const Notification = require("../models/Notification");

const getDashboard = async (req, res) => {
    try {
        const kitchenId = req.user._id;

        const records = await ProductionRecord
            .find({ kitchen: kitchenId })
            .sort({ date: -1 });

        let expectedDemand = 0;
        let preparedQuantity = 0;
        let consumedQuantity = 0;
        let surplusQuantity = 0;
        let wastedQuantity = 0;

        records.forEach((record) => {
            expectedDemand += record.expectedDemand || 0;
            preparedQuantity += record.preparedQuantity || 0;
            consumedQuantity += record.consumedQuantity || 0;
            surplusQuantity += record.surplusQuantity || 0;
            wastedQuantity += record.wastedQuantity || 0;
        });

        res.render("kitchen/dashboard", {
            title: "Kitchen Dashboard",
            user: req.user,
            records,
            stats: {
                expectedDemand,
                preparedQuantity,
                consumedQuantity,
                surplusQuantity,
                wastedQuantity
            }
        });

    } catch (error) {
        console.error("Kitchen dashboard error:", error.message);

        res.status(500).send("Unable to load kitchen dashboard.");
    }
};


const createProductionRecord = async (req, res) => {
    try {
        const {
            foodItem,
            date,
            expectedDemand,
            preparedQuantity,
            consumedQuantity,
            surplusQuantity,
            wastedQuantity,
            unit,
            notes
        } = req.body;

        await ProductionRecord.create({
            kitchen: req.user._id,
            foodItem,
            date,
            expectedDemand,
            preparedQuantity,
            consumedQuantity,
            surplusQuantity,
            wastedQuantity,
            unit,
            notes
        });

        res.redirect("/dashboard/kitchen");

    } catch (error) {
        console.error("Production record error:", error.message);

        res.status(500).send("Unable to create production record.");
    }
};

// ===============================
// KITCHEN FOOD REQUESTS
// ===============================

const getFoodRequests = async (req, res) => {
    try {

        const requests = await FoodRequest.find()
            .populate("ngo", "name organizationName email phone city")
            .populate({
                path: "surplusFood",
                match: {
                    kitchen: req.user._id
                }
            })
            .sort({ createdAt: -1 });

        // Sirf isi kitchen ki surplus food requests
        const kitchenRequests = requests.filter(
            request => request.surplusFood
        );

        res.render("kitchen/requests", {
            title: "Food Requests",
            user: req.user,
            requests: kitchenRequests
        });

    } catch (error) {

        console.error(
            "Kitchen requests error:",
            error.message
        );

        res.status(500).send(
            "Unable to load food requests."
        );
    }
};

// ========================================
// APPROVE FOOD REQUEST
// ========================================

const approveFoodRequest = async (req, res) => {
    try {

        const request = await FoodRequest
            .findById(req.params.id)
            .populate("surplusFood");

        if (!request) {
            return res.status(404).send(
                "Food request not found."
            );
        }


        const surplusFood = request.surplusFood;


        if (!surplusFood) {
            return res.status(404).send(
                "Surplus food not found."
            );
        }


        /* Make sure this food belongs to current kitchen */

        if (
            surplusFood.kitchen.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).send(
                "You are not allowed to approve this request."
            );
        }


        /* Request must be pending */

        if (request.status !== "pending") {
            return res.status(400).send(
                "This request has already been processed."
            );
        }


        /* Check available quantity */

        if (
            request.quantityRequested >
            surplusFood.quantity
        ) {
            return res.status(400).send(
                "Requested quantity is greater than available surplus."
            );
        }


        /* Reserve requested quantity */

        surplusFood.quantity -=
            request.quantityRequested;


        /* Update surplus status */

        if (surplusFood.quantity === 0) {

            surplusFood.status = "assigned";

        } else {

            surplusFood.status = "requested";

        }


        await surplusFood.save();


        /* Approve request */

        request.status = "approved";

        await request.save();

        await Notification.create({
            recipient: request.ngo,
            type: "request_approved",
            title: "Food Request Approved",
            message: `Your request for ${request.quantityRequested} ${surplusFood.unit} of ${surplusFood.foodName} has been approved by the kitchen.`,
            relatedRequest: request._id,
            relatedSurplus: surplusFood._id
        });


        res.redirect(
            "/dashboard/kitchen/requests"
        );

    } catch (error) {

        console.error(
            "Approve food request error:",
            error
        );

        res.status(500).send(
            "Unable to approve food request."
        );

    }
};

// ========================================
// REJECT FOOD REQUEST
// ========================================
const rejectFoodRequest = async (req, res) => {
    try {
        const request = await FoodRequest
            .findById(req.params.id)
            .populate("surplusFood");

        if (!request) {
            return res.status(404).send("Food request not found.");
        }

        const surplusFood = request.surplusFood;

        if (!surplusFood) {
            return res.status(404).send("Surplus food not found.");
        }

        // Check that this request belongs to this kitchen
        if (
            surplusFood.kitchen.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).send(
                "You are not allowed to reject this request."
            );
        }

        // Request already processed
        if (request.status !== "pending") {
            return res.status(400).send(
                "This request has already been processed."
            );
        }

        // Reject request
        request.status = "rejected";
        await request.save();

        // Notify NGO
        await Notification.create({
            recipient: request.ngo,
            type: "request_rejected",
            title: "Food Request Rejected",
            message: `Your request for ${request.quantityRequested} ${surplusFood.unit} of ${surplusFood.foodName} has been rejected by the kitchen.`,
            relatedRequest: request._id,
            relatedSurplus: surplusFood._id
        });
        console.log("✅ Reject notification created:");
        console.log(notification);

        res.redirect("/dashboard/kitchen/requests");

    } catch (error) {
        console.error("Reject request error:", error);
        res.status(500).send("Unable to reject food request.");
    }
};


module.exports = {
    getDashboard,
    createProductionRecord,
    getFoodRequests,
    approveFoodRequest,
    rejectFoodRequest
};