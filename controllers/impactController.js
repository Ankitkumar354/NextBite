const crypto = require("crypto");
const ImpactCertificate = require("../models/ImpactCertificate");
const { calculateImpact } = require("../services/impactService");
const { KG_PER_UNIT, CO2E_PER_KG_FOOD, METHOD_NOTE } = require("../config/impact");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CERT_ID_RE = /^NB-\d{4}-[A-F0-9]{8}$/;

// "2026-04-01" -> Date (invalid ho to null)
function parseDate(value, endOfDay = false) {
    if (typeof value !== "string" || !DATE_RE.test(value)) return null;
    const d = new Date(value + (endOfDay ? "T23:59:59.999" : "T00:00:00"));
    return Number.isNaN(d.getTime()) ? null : d;
}

// Default period = current financial year (1 Apr - 31 Mar)
function defaultPeriod() {
    const now = new Date();
    const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return { from: `${fy}-04-01`, to: `${fy + 1}-03-31` };
}

function baseUrl(req) {
    return process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
}


// ========================================
// IMPACT SUMMARY PAGE
// ========================================
const getImpactPage = async (req, res) => {
    try {
        const defaults = defaultPeriod();
        const from = DATE_RE.test(req.query.from || "") ? req.query.from : defaults.from;
        const to = DATE_RE.test(req.query.to || "") ? req.query.to : defaults.to;

        const impact = await calculateImpact(
            req.user._id,
            parseDate(from),
            parseDate(to, true)
        );

        const certificates = await ImpactCertificate
            .find({ kitchen: req.user._id })
            .sort({ issuedAt: -1 })
            .lean();

        res.render("kitchen/impact", {
            title: "Environmental Impact",
            impact,
            from,
            to,
            certificates,
            error: req.query.error || null
        });

    } catch (error) {
        console.error("Impact page error:", error.message);
        res.status(500).send("Unable to load impact page.");
    }
};


// ========================================
// GENERATE CERTIFICATE
// ========================================
const createCertificate = async (req, res) => {
    try {
        const from = parseDate(req.body.from);
        const to = parseDate(req.body.to, true);

        if (!from || !to || from > to) {
            return res.redirect("/dashboard/kitchen/impact?error=Invalid+date+range");
        }

        const impact = await calculateImpact(req.user._id, from, to);

        if (impact.deliveries === 0) {
            return res.redirect(
                "/dashboard/kitchen/impact?error=No+delivered+food+in+this+period"
            );
        }

        const certificateId =
            `NB-${new Date().getFullYear()}-` +
            crypto.randomBytes(4).toString("hex").toUpperCase();

        await ImpactCertificate.create({
            kitchen: req.user._id,
            certificateId,
            periodStart: from,
            periodEnd: to,
            deliveries: impact.deliveries,
            foodKg: impact.foodKg,
            co2eKg: impact.co2eKg,
            breakdown: impact.breakdown,
            factors: {
                co2ePerKgFood: CO2E_PER_KG_FOOD,
                kgPerUnit: KG_PER_UNIT
            }
        });

        res.redirect(`/dashboard/kitchen/impact/certificates/${certificateId}`);

    } catch (error) {
        console.error("Create certificate error:", error.message);
        res.status(500).send("Unable to generate certificate.");
    }
};


// ========================================
// VIEW / PRINT CERTIFICATE (kitchen)
// ========================================
const viewCertificate = async (req, res) => {
    try {
        const certificate = await ImpactCertificate
            .findOne({
                certificateId: req.params.certificateId,
                kitchen: req.user._id          // sirf apna certificate
            })
            .lean();

        if (!certificate) {
            return res.status(404).render("404", { title: "Page Not Found" });
        }

        res.render("kitchen/certificate", {
            title: `Certificate ${certificate.certificateId}`,
            certificate,
            kitchen: req.user,
            verifyUrl: `${baseUrl(req)}/verify/${certificate.certificateId}`,
            methodNote: METHOD_NOTE
        });

    } catch (error) {
        console.error("View certificate error:", error.message);
        res.status(500).send("Unable to load certificate.");
    }
};


// ========================================
// PUBLIC VERIFY (bina login ke)
// ========================================
const verifyCertificate = async (req, res) => {
    try {
        if (!CERT_ID_RE.test(req.params.certificateId)) {
            return res.status(404).render("verify", {
                title: "Verify Certificate",
                certificate: null
            });
        }

        const certificate = await ImpactCertificate
            .findOne({ certificateId: req.params.certificateId })
            .populate("kitchen", "organizationName name city")
            .lean();

        res.status(certificate ? 200 : 404).render("verify", {
            title: "Verify Certificate",
            certificate
        });

    } catch (error) {
        console.error("Verify certificate error:", error.message);
        res.status(500).send("Unable to verify certificate.");
    }
};

module.exports = {
    getImpactPage,
    createCertificate,
    viewCertificate,
    verifyCertificate
};