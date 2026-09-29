const User = require("../models/User");

// ========================================
// VIEW PROFILE
// ========================================

const getProfile = async (req, res) => {
    try {

        const user = await User
            .findById(req.user._id)
            .select("-password");

        if (!user) {
            return res.status(404).send(
                "User profile not found."
            );
        }

        res.render("profile/index", {
            title: "My Profile",
            user
        });

    } catch (error) {

        console.error(
            "Get profile error:",
            error
        );

        res.status(500).send(
            "Unable to load profile."
        );
    }
};


// ========================================
// UPDATE PROFILE
// ========================================

const updateProfile = async (req, res) => {
    try {

        const {
            name,
            phone,
            organizationName,
            address,
            city
        } = req.body;


        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).send(
                "User profile not found."
            );
        }


        // Update allowed fields only

        user.name = name?.trim() || user.name;

        user.phone = phone?.trim() || "";

        user.organizationName =
            organizationName?.trim() || "";

        user.address =
            address?.trim() || "";

        user.city =
            city?.trim() || "";


        await user.save();


        res.redirect("/profile");


    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        res.status(500).send(
            "Unable to update profile."
        );
    }
};


module.exports = {
    getProfile,
    updateProfile
};