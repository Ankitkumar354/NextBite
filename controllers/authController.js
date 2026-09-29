const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ========================================
// REGISTER
// ========================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            role,
            organizationName,
            address,
            city
        } = req.body;


        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).send(
                "User with this email already exists."
            );

        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        // Create user
        const user = await User.create({

            name,
            email,
            phone,
            password: hashedPassword,
            role,
            organizationName,
            address,
            city

        });


        console.log(
            `✅ User registered: ${user.email}`
        );


        res.redirect("/login");

    } catch (error) {

        console.error(
            "Registration error:",
            error.message
        );

        res.status(500).send(
            "Registration failed."
        );
    }
};


// ========================================
// LOGIN
// ========================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send("Invalid email or password.");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send("Invalid email or password.");
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        console.log(`✅ Login successful: ${user.email}`);

        res.redirect("/dashboard");

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).send("Login failed.");
    }
};

const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};

