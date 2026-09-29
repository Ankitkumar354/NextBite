const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.redirect("/login");
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User
            .findById(decoded.userId)
            .select("-password");

        if (!user || !user.isActive) {
            res.clearCookie("token");
            return res.redirect("/login");
        }

        req.user = user;

        next();

    } catch (error) {

        console.error("Auth error:", error.message);

        res.clearCookie("token");

        return res.redirect("/login");
    }
};


const requireRole = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.redirect("/login");
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).render("403", {
                title: "Access Denied"
            });
        }

        next();
    };
};


module.exports = {
    requireAuth,
    requireRole
};