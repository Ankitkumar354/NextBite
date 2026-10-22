const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const mongoose = require("mongoose");
const { calculateImpact } = require("../services/impactService");

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const kitchenId = process.argv[2];            // kisi kitchen user ki _id
    console.log(await calculateImpact(kitchenId));
    await mongoose.disconnect();
})();