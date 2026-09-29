const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser
} = require("../controllers/authController");


// Register
router.post(
    "/register",
    registerUser
);


// Login
router.post(
    "/login",
    loginUser
);

router.post("/logout", logoutUser);


module.exports = router;