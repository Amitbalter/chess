require("dotenv").config();

const mongoose = require("mongoose");
mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("Connected to Database");
    })
    .catch((err) => {
        console.log("connection error:", err);
    });
const db = mongoose.connection;

db.dropCollection("games")
    .then(() => {
        console.log("games collection dropped");
    })
    .catch((err) => console.log(err));

db.createCollection("games")
    .then(() => {
        console.log("games collection created");
    })
    .catch((err) => console.log(err));
