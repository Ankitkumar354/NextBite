
const express = require("express");
const path = require("path");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Notification = require("./models/Notification");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const kitchenRoutes = require("./routes/kitchenRoutes");
const surplusRoutes = require("./routes/surplusRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const predictionRoutes =
    require("./routes/predictionRoutes");
const surplusPlanRoutes = require("./routes/surplusPlanRoutes");
const notificationRoutes =
    require("./routes/notificationRoutes");
    const profileRoutes =
    require("./routes/profileRoutes");

const app = express();


// ===============================
// BASIC MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));


// ===============================
// EJS CONFIGURATION
// ===============================

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);

app.use(expressLayouts);

app.set(
    "layout",
    "layouts/boilerplate"
);


// ===============================
// CURRENT USER MIDDLEWARE
// ===============================
app.use(async (req, res, next) => {
    try {

        const token = req.cookies.token;

        if (token) {

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const user = await User
                .findById(decoded.userId)
                .select("-password");

            res.locals.currentUser = user;


            // ========================================
            // UNREAD NOTIFICATION COUNT
            // ========================================

            if (user) {

                const unreadNotificationCount =
                    await Notification.countDocuments({
                        recipient: user._id,
                        isRead: false
                    });

                res.locals.unreadNotificationCount =
                    unreadNotificationCount;

            } else {

                res.locals.unreadNotificationCount = 0;

            }

        } else {

            res.locals.currentUser = null;
            res.locals.unreadNotificationCount = 0;

        }

    } catch (error) {

        res.locals.currentUser = null;
        res.locals.unreadNotificationCount = 0;

    }

    next();
});


// ===============================
// HOME ROUTES
// ===============================

app.get("/", (req, res) => {

    res.render("home", {
        title: "SmartFood AI"
    });

});

app.get("/how-it-works", (req, res) => {
    res.render("how-it-works", {
        title: "How It Works - SmartFood AI"
    });
});


app.get("/register", (req, res) => {

    res.render("auth/register", {
        title: "Register - SmartFood AI"
    });

});


app.get("/login", (req, res) => {

    res.render("auth/login", {
        title: "Login - SmartFood AI"
    });

});

app.use(
    "/profile",
    profileRoutes
);


// ===============================
// AUTH ROUTES
// ===============================

app.use(
    "/auth",
    authRoutes
);


// ===============================
// DASHBOARD ROUTES
// ===============================

app.use(
    "/dashboard",
    dashboardRoutes
);


// ===============================
// KITCHEN ROUTES
// ===============================

app.use(
    "/dashboard/kitchen",
    kitchenRoutes
);


// ===============================
// SURPLUS FOOD ROUTES
// ===============================

app.use(
    "/dashboard/kitchen/surplus",
    surplusRoutes
);

app.use(
    "/dashboard/delivery",
    deliveryRoutes
);

app.use(
    "/dashboard/kitchen/prediction",
    predictionRoutes
);

app.use(
    "/dashboard/kitchen/surplus-plans",
    surplusPlanRoutes
);
app.use(
    "/notifications",
    notificationRoutes
);


// ===============================
// 404 ROUTE
// ALWAYS LAST
// ===============================

app.use((req, res) => {

    res.status(404).render("404", {
        title: "Page Not Found"
    });

});


module.exports = app;