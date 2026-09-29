const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

// Root .env load karo
require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const User = require("../models/User");

const createAdmin = async () => {
    try {
        console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const email = "admin@smartfood.ai";

        const existingAdmin = await User.findOne({
            email
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@123",
            12
        );

        const admin = await User.create({
            name: "SmartFood Admin",
            email,
            phone: "",
            password: hashedPassword,
            role: "admin",
            organizationName: "SmartFood AI",
            address: "",
            city: "Kanpur",
            isVerified: true,
            isActive: true
        });

        console.log("================================");
        console.log("Admin created successfully");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);
        console.log("================================");

        process.exit(0);

    } catch (error) {
        console.error("Admin creation failed:", error);
        process.exit(1);
    }
};

createAdmin();