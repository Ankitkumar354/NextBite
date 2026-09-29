const FoodRequest = require("../models/FoodRequest");
const User = require("../models/User");
const SurplusFood = require("../models/SurplusFood");
const Notification = require("../models/Notification");


// ========================================
// ADMIN DELIVERY ASSIGNMENT PAGE
// ========================================

const getDeliveryAssignments = async (req, res) => {

    try {

        const requests = await FoodRequest
            .find({
                status: "approved"
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
                updatedAt: -1
            });


        const deliveryUsers = await User
            .find({
                role: "delivery"
            })
            .select("name email city");


        res.render(
            "admin/delivery-assignments",
            {
                title: "Delivery Assignments",
                user: req.user,
                requests,
                deliveryUsers
            }
        );


    } catch (error) {

        console.error(
            "Delivery assignment page error:",
            error
        );

        res.status(500).send(
            "Unable to load delivery assignments."
        );
    }
};



// ========================================
// ASSIGN DELIVERY
// ========================================
const assignDelivery = async (req, res) => {
try {


    const { deliveryPersonId } = req.body;


    // ===============================
    // CHECK REQUEST
    // ===============================

    const request = await FoodRequest
        .findById(req.params.id)
        .populate(
            "surplusFood",
            "foodName unit"
        );


    if (!request) {
        return res.status(404).send(
            "Food request not found."
        );
    }


    // ===============================
    // CHECK REQUEST STATUS
    // ===============================

    if (request.status !== "approved") {
        return res.status(400).send(
            `Only approved requests can be assigned. Current status: ${request.status}`
        );
    }


    // ===============================
    // CHECK DELIVERY PERSON ID
    // ===============================

    if (!deliveryPersonId) {
        return res.status(400).send(
            "Delivery person is required."
        );
    }


    // ===============================
    // FIND DELIVERY PERSON
    // ===============================

    const deliveryPerson = await User.findById(
        deliveryPersonId
    );


    if (!deliveryPerson) {
        return res.status(404).send(
            "Delivery person user not found."
        );
    }


    // ===============================
    // CHECK ROLE
    // ===============================

    if (deliveryPerson.role !== "delivery") {

        return res.status(400).send(
            `Selected user role is "${deliveryPerson.role}", not "delivery".`
        );

    }


    // ===============================
    // CHECK ACTIVE STATUS
    // ===============================

    if (!deliveryPerson.isActive) {

        return res.status(400).send(
            "Selected delivery person is inactive."
        );

    }


    // ===============================
    // ASSIGN DELIVERY
    // ===============================

    request.deliveryPerson =
        deliveryPerson._id;

    request.assignedAt =
        new Date();

    request.status =
        "assigned";


    await request.save();


    // ===============================
    // NOTIFY DELIVERY PERSON
    // ===============================

    await Notification.create({

        recipient: deliveryPerson._id,

        type: "delivery_assigned",

        title: "New Delivery Assigned",

        message:
            `You have been assigned a delivery for ` +
            `${request.quantityRequested} ` +
            `${request.surplusFood?.unit || ""} of ` +
            `${request.surplusFood?.foodName || "food"}. ` +
            `Please check your delivery dashboard.`,

        relatedRequest: request._id,

        relatedSurplus:
            request.surplusFood?._id || null

    });


    console.log(
        "✅ Delivery assigned successfully."
    );

    console.log(
        "🔔 Delivery notification created."
    );


    // ===============================
    // REDIRECT
    // ===============================

    res.redirect(
        "/dashboard/admin/delivery-assignments"
    );


} catch (error) {

    console.error(
        "Assign delivery error:",
        error
    );

    res.status(500).send(
        "Unable to assign delivery."
    );

}


};


// ========================================
// ADMIN DASHBOARD
// ========================================

const getDashboard = async (req, res) => {

    try {

        const [
            totalUsers,
            totalKitchens,
            totalNGOs,
            totalDelivery,
            totalProcessing,
            availableSurplus,
            pendingRequests,
            approvedRequests,
            deliveredRequests
        ] = await Promise.all([

            User.countDocuments(),

            User.countDocuments({
                role: "kitchen"
            }),

            User.countDocuments({
                role: "ngo"
            }),

            User.countDocuments({
                role: "delivery"
            }),

            User.countDocuments({
                role: "processing"
            }),

            SurplusFood.countDocuments({
                status: "available"
            }),

            FoodRequest.countDocuments({
                status: "pending"
            }),

            FoodRequest.countDocuments({
                status: "approved"
            }),

            FoodRequest.countDocuments({
                status: "delivered"
            })

        ]);


        res.render(
            "admin/dashboard",
            {
                title: "Admin Dashboard",

                user: req.user,

                stats: {
                    totalUsers,
                    totalKitchens,
                    totalNGOs,
                    totalDelivery,
                    totalProcessing,
                    availableSurplus,
                    pendingRequests,
                    approvedRequests,
                    deliveredRequests
                }
            }
        );


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        res.status(500).send(
            "Unable to load admin dashboard."
        );
    }
};

// ========================================
// ADMIN → USER MANAGEMENT
// ========================================

const getUsers = async (req, res) => {
    try {

        const selectedRole = req.query.role || "all";

        const filter = {};

        if (selectedRole !== "all") {
            filter.role = selectedRole;
        }

        const users = await User
            .find(filter)
            .select("-password")
            .sort({
                createdAt: -1
            });

        res.render("admin/users", {
            title: "User Management",
            user: req.user,
            users,
            selectedRole
        });

    } catch (error) {

        console.error(
            "User management error:",
            error
        );

        res.status(500).send(
            "Unable to load users."
        );
    }
};


// ========================================
// ACTIVATE / DEACTIVATE USER
// ========================================

const toggleUserStatus = async (req, res) => {
    try {

        const targetUser = await User.findById(
            req.params.id
        );

        if (!targetUser) {
            return res.status(404).send(
                "User not found."
            );
        }


        // Admin ko khud deactivate nahi karna
        if (
            targetUser._id.toString() ===
            req.user._id.toString()
        ) {
            return res.status(400).send(
                "You cannot deactivate your own account."
            );
        }


        targetUser.isActive =
            !targetUser.isActive;

        await targetUser.save();


        res.redirect(
            "/dashboard/admin/users"
        );

    } catch (error) {

        console.error(
            "Toggle user status error:",
            error
        );

        res.status(500).send(
            "Unable to update user status."
        );
    }
};

const getFoodRequests = async (req, res) => {

    try {

        const selectedStatus =
            req.query.status || "all";


        const filter = {};

        if (selectedStatus !== "all") {
            filter.status = selectedStatus;
        }


        const requests = await FoodRequest
            .find(filter)

            .populate(
                "ngo",
                "name email organizationName city"
            )

            .populate({
                path: "surplusFood",
                populate: {
                    path: "kitchen",
                    select: "name organizationName city"
                }
            })

            .populate(
                "deliveryPerson",
                "name email phone"
            )

            .sort({
                createdAt: -1
            });


        res.render(
            "admin/food-requests",
            {
                title: "Food Requests",
                user: req.user,
                requests,
                selectedStatus
            }
        );


    } catch (error) {

        console.error(
            "Admin food requests error:",
            error
        );

        res.status(500).send(
            "Unable to load food requests."
        );
    }
};

// ========================================
// SUSTAINABILITY ANALYTICS
// ========================================

const getAnalytics = async (req, res) => {

    try {

        const [
            totalSurplus,
            availableSurplus,
            totalRequests,
            deliveredRequests,
            activeKitchens,
            activeNGOs,
            activeDelivery
        ] = await Promise.all([

            SurplusFood.countDocuments(),

            SurplusFood.countDocuments({
                status: "available"
            }),

            FoodRequest.countDocuments(),

            FoodRequest.countDocuments({
                status: "delivered"
            }),

            User.countDocuments({
                role: "kitchen",
                isActive: true
            }),

            User.countDocuments({
                role: "ngo",
                isActive: true
            }),

            User.countDocuments({
                role: "delivery",
                isActive: true
            })

        ]);


        // --------------------------------
        // Delivered quantity
        // --------------------------------

        const deliveredData =
            await FoodRequest.aggregate([

                {
                    $match: {
                        status: "delivered"
                    }
                },

                {
                    $group: {
                        _id: null,
                        totalQuantity: {
                            $sum: "$quantityRequested"
                        }
                    }
                }

            ]);


        const deliveredQuantity =
            deliveredData.length > 0
                ? deliveredData[0].totalQuantity
                : 0;


        // --------------------------------
        // Estimated meals
        // --------------------------------

        /*
            Approximation:
            1 plate/unit = 1 meal

            For kg/litre:
            simple project-level estimate
        */

        const estimatedMeals =
            Math.round(deliveredQuantity);


        // --------------------------------
        // Waste prevented
        // --------------------------------

        const wastePrevented =
            Math.round(deliveredQuantity);


        // --------------------------------
        // Redistribution rate
        // --------------------------------

        const redistributionRate =
            totalRequests > 0
                ? Math.round(
                    (deliveredRequests /
                    totalRequests) * 100
                )
                : 0;


        res.render(
            "admin/analytics",
            {

                title: "Sustainability Analytics",

                user: req.user,

                analytics: {

                    totalSurplus,

                    availableSurplus,

                    totalRequests,

                    deliveredRequests,

                    deliveredQuantity,

                    estimatedMeals,

                    wastePrevented,

                    redistributionRate,

                    activeKitchens,

                    activeNGOs,

                    activeDelivery

                }

            }
        );


    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );

        res.status(500).send(
            "Unable to load analytics."
        );

    }

};


// ========================================
// DELIVERY ASSIGNMENTS
// ========================================

// keep your existing functions
// getDeliveryAssignments
// assignDelivery



module.exports = {
    getDashboard,
    getDeliveryAssignments,
    assignDelivery,
    getUsers,
    toggleUserStatus,
    getFoodRequests,
    getAnalytics
};