const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json([
        {
            username: "Amitbalter",
            age: 25,
        },
    ]);
});

module.exports = router;
