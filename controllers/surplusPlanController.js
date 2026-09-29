const SurplusPlan = require("../models/SurplusPlan");
const SurplusFood = require("../models/SurplusFood");


/* =========================================
   GET SURPLUS PLANS
========================================= */

const getSurplusPlans = async (req, res) => {

    try {

        const plans = await SurplusPlan
            .find({
                kitchen: req.user._id
            })
            .sort({
                plannedDate: 1
            });

        res.render(
            "kitchen/surplus-plans",
            {
                title: "Surplus Plans",
                user: req.user,
                plans
            }
        );

    } catch (error) {

        console.error(
            "Surplus plans error:",
            error
        );

        res.status(500).send(
            "Unable to load surplus plans."
        );

    }

};


/* =========================================
   PUBLISH SURPLUS PLAN
========================================= */

const publishSurplusPlan = async (req, res) => {

    try {

        const plan = await SurplusPlan.findOne({
            _id: req.params.id,
            kitchen: req.user._id
        });

        if (!plan) {

            return res.status(404).send(
                "Surplus plan not found."
            );

        }


        /* Prevent duplicate publishing */

        if (plan.status === "published") {

            return res.status(400).send(
                "This surplus plan has already been published."
            );

        }


        if (plan.status === "cancelled") {

            return res.status(400).send(
                "Cancelled surplus plans cannot be published."
            );

        }


        /* Validate surplus */

        if (plan.expectedSurplus <= 0) {

            return res.status(400).send(
                "There is no expected surplus to publish."
            );

        }


        /* Create actual surplus food */

        await SurplusFood.create({

            kitchen: req.user._id,

            foodName: plan.foodName,

            category: plan.category,

            quantity: plan.expectedSurplus,

            unit: plan.unit,

            preparedAt: plan.plannedDate,

            pickupDeadline: new Date(
                new Date(plan.plannedDate).getTime()
                + 24 * 60 * 60 * 1000
            ),

            description:
                `AI-generated surplus plan. ` +
                `Predicted demand: ${plan.predictedDemand}. ` +
                `Recommended preparation: ${plan.recommendedPreparation}. ` +
                `Expected surplus: ${plan.expectedSurplus}.`,

            pickupAddress:
                req.user.address || "Kitchen address",

            city:
                req.user.city || "Not specified",

            status: "available"

        });


        /* Update plan status */

        plan.status = "published";

        await plan.save();


        res.redirect(
            "/dashboard/kitchen/surplus-plans"
        );

    } catch (error) {

        console.error(
            "Publish surplus plan error:",
            error
        );

        res.status(500).send(
            "Unable to publish surplus plan."
        );

    }

};


module.exports = {
    getSurplusPlans,
    publishSurplusPlan
};