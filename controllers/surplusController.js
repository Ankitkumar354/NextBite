const SurplusFood = require("../models/SurplusFood");
const cloudinary = require("../config/cloudinary");
const qualityAssessment = require("../services/qualityAssessment");
const ngoRecommendation = require("../services/ngoRecommendation");

const getSurplusPage = async (req, res) => {
    try {

        const surplusFoods = await SurplusFood
            .find({
                kitchen: req.user._id
            })
            .sort({
                createdAt: -1
            });

        res.render("kitchen/surplus", {
            title: "Surplus Food",
            user: req.user,
            surplusFoods
        });

    } catch (error) {

        console.error(
            "Surplus page error:",
            error.message
        );

        res.status(500).send(
            "Unable to load surplus food."
        );
    }
};


const createSurplusFood = async (req, res) => {

    try {

        console.log("FILE:", req.file);

        const {
            foodName,
            category,
            quantity,
            unit,
            preparedAt,
            pickupDeadline,
            description,
            pickupAddress,
            city,
            kitchenLat,
            kitchenLon
        } = req.body;


        // =========================
        // BASIC VALIDATION
        // =========================

        if (
            !foodName ||
            !quantity ||
            !preparedAt ||
            !pickupDeadline ||
            !pickupAddress ||
            !city
        ) {

            return res.status(400).send(
                "Please fill all required fields."
            );
        }


        // =========================
        // DATE VALIDATION
        // =========================

        const preparedDate = new Date(preparedAt);
        const deadlineDate = new Date(pickupDeadline);


        if (isNaN(preparedDate.getTime())) {

            return res.status(400).send(
                "Invalid Prepared At date."
            );
        }


        if (isNaN(deadlineDate.getTime())) {

            return res.status(400).send(
                "Invalid Pickup Deadline."
            );
        }


        if (deadlineDate <= preparedDate) {

            return res.status(400).send(
                "Pickup Deadline must be later than Prepared At."
            );
        }


        // =========================
        // QUANTITY VALIDATION
        // =========================

        const numericQuantity = Number(quantity);

        if (
            isNaN(numericQuantity) ||
            numericQuantity <= 0
        ) {

            return res.status(400).send(
                "Quantity must be greater than 0."
            );
        }

        let imageData = {
            url: "",
            filename: ""
        };

        if (req.file) {

            const result = await new Promise((resolve, reject) => {

                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "smart-food-ai/surplus-food"
                    },
                    (error, result) => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }

                    }
                );

                stream.end(req.file.buffer);
            });

            imageData = {
                url: result.secure_url,
                filename: result.public_id
            };
        }


        // =========================
        // 🤖 AI VISION QUALITY CHECK
        // (Cloudinary URL par chalega, image already upload ho chuki hai)
        // =========================

        let aiQuality = null;

        if (imageData.url) {

            try {

                aiQuality = await qualityAssessment.analyzeFoodImage(
                    imageData.url
                );

            } catch (aiError) {

                console.error(
                    "AI quality check failed:",
                    aiError
                );
                // AI fail ho jaye to bhi listing create hoti rahegi
            }
        }


        // =========================
        // 🤖 AI NGO RECOMMENDATION
        // =========================

        let recommendedNgo = null;

        try {

            const lat = kitchenLat || 26.4499;
            const lon = kitchenLon || 80.3319;

            recommendedNgo = await ngoRecommendation.recommendNearestNGO(
                lat,
                lon
            );

        } catch (ngoError) {

            console.error(
                "NGO recommendation failed:",
                ngoError
            );
        }


        // =========================
        // CREATE SURPLUS
        // =========================
        console.log("IMAGE DATA:", imageData);
        console.log("AI QUALITY:", aiQuality);
        console.log("RECOMMENDED NGO:", recommendedNgo);

        await SurplusFood.create({

            kitchen: req.user._id,

            foodName: foodName.trim(),

            category,

            quantity: numericQuantity,

            unit,

            preparedAt: preparedDate,

            pickupDeadline: deadlineDate,

            description: description
                ? description.trim()
                : "",

            pickupAddress: pickupAddress.trim(),

            city: city.trim(),

            image: {
                url: imageData.url,
                filename: imageData.filename
            },

            qualityStatus: aiQuality
                ? aiQuality.quality_status
                : "Pending Analysis",

            shelfLifeHours: aiQuality
                ? aiQuality.shelf_life_hours
                : null,

            aiConfidence: aiQuality
                ? aiQuality.confidence_score
                : null,

            status: "available"

        });


        // =========================
        // SUCCESS
        // =========================

        res.redirect(
            "/dashboard/kitchen/surplus"
        );


    } catch (error) {

        console.error(
            "Create surplus error:",
            error.message
        );

        res.status(500).send(
            "Unable to create surplus food listing."
        );
    }
};


const cancelSurplusFood = async (req, res) => {

    try {

        const surplus = await SurplusFood.findOne({

            _id: req.params.id,

            kitchen: req.user._id

        });


        if (!surplus) {

            return res.status(404).send(
                "Surplus food not found."
            );
        }


        if (surplus.status !== "available") {

            return res.status(400).send(
                "This listing cannot be cancelled."
            );
        }


        surplus.status = "cancelled";

        await surplus.save();


        res.redirect(
            "/dashboard/kitchen/surplus"
        );


    } catch (error) {

        console.error(
            "Cancel surplus error:",
            error.message
        );

        res.status(500).send(
            "Unable to cancel listing."
        );
    }
};


module.exports = {
    getSurplusPage,
    createSurplusFood,
    cancelSurplusFood
};