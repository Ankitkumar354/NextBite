const SurplusFood = require("../models/SurplusFood");
const FoodRequest = require("../models/FoodRequest");
const Notification = require("../models/Notification");

// ========================================
// NGO DASHBOARD
// ========================================
const getDashboard = async (req, res) => {
    try {
        // Available surplus food
        const surplusFoods = await SurplusFood.find({
            status: "available",
            pickupDeadline: { $gte: new Date() }
        })
            .populate("kitchen", "name organizationName city")
            .sort({ pickupDeadline: 1 });


        // NGO ke saare food requests
        const myRequests = await FoodRequest.find({
            ngo: req.user._id
        })
            .populate({
                path: "surplusFood",
                populate: {
                    path: "kitchen",
                    select: "name organizationName city"
                }
            })

            .populate(
                "deliveryPerson",
                "name phone city"
            )
            .sort({ createdAt: -1 });


        // Total requests
        const totalRequests = myRequests.length;


        // Completed requests
        const completedRequests = myRequests.filter(
            request => request.status === "delivered"
        ).length;


        // Approved requests
        const approvedRequests = myRequests.filter(
            request =>
                request.status === "approved" ||
                request.status === "assigned" ||
                request.status === "picked_up" ||
                request.status === "in_transit"
        ).length;


        res.render("ngo/dashboard", {
            title: "NGO Dashboard",
            user: req.user,
            surplusFoods,
            myRequests,
            stats: {
                availableFood: surplusFoods.length,
                totalRequests,
                approvedRequests,
                completedRequests
            }
        });

    } catch (error) {

        console.error("NGO dashboard error:", error);

        res.status(500).send(
            "Unable to load NGO dashboard."
        );
    }
};



// ========================================
// CREATE FOOD REQUEST
// ========================================

const createFoodRequest = async (req, res) => {
    try {

        const {
            quantityRequested,
            message
        } = req.body;


        // ========================================
        // FIND SURPLUS FOOD
        // ========================================

        const surplusFood = await SurplusFood.findById(
            req.params.id
        );

        if (!surplusFood) {
            return res.status(404).send(
                "Surplus food not found."
            );
        }


        // ========================================
        // CHECK STATUS
        // ========================================

        if (surplusFood.status !== "available") {
            return res.status(400).send(
                "This surplus food is no longer available."
            );
        }


        // ========================================
        // CHECK DEADLINE
        // ========================================

        if (
            new Date(surplusFood.pickupDeadline) <
            new Date()
        ) {
            return res.status(400).send(
                "Pickup deadline has expired."
            );
        }


        // ========================================
        // CHECK QUANTITY
        // ========================================

        if (
            Number(quantityRequested) <= 0 ||
            Number(quantityRequested) >
            surplusFood.quantity
        ) {
            return res.status(400).send(
                "Invalid requested quantity."
            );
        }


        // ========================================
        // CHECK DUPLICATE REQUEST
        // ========================================

        const existingRequest =
            await FoodRequest.findOne({
                ngo: req.user._id,
                surplusFood: surplusFood._id,
                status: "pending"
            });

        if (existingRequest) {
            return res.status(400).send(
                "You already have a pending request for this food."
            );
        }


        // ========================================
        // CREATE REQUEST
        // ========================================

        const foodRequest =
            await FoodRequest.create({
                ngo: req.user._id,
                surplusFood: surplusFood._id,
                quantityRequested:
                    Number(quantityRequested),
                message
            });


        // ========================================
        // UPDATE SURPLUS STATUS
        // ========================================

        surplusFood.status = "requested";

        await surplusFood.save();


        // ========================================
        // NOTIFY KITCHEN
        // ========================================

        await Notification.create({

            recipient: surplusFood.kitchen,

            type: "food_request",

            title: "New Food Request",

            message:
                `${req.user.organizationName || req.user.name} ` +
                `has requested ${quantityRequested} ` +
                `${surplusFood.unit} of ` +
                `${surplusFood.foodName}.`,

            relatedRequest:
                foodRequest._id,

            relatedSurplus:
                surplusFood._id

        });


        // ========================================
        // REDIRECT
        // ========================================

        res.redirect("/dashboard/ngo");


    } catch (error) {

        console.error(
            "Create food request error:",
            error
        );

        res.status(500).send(
            "Unable to create food request."
        );
    }
};



module.exports = {
    getDashboard,
    createFoodRequest
};