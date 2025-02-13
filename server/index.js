require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

db.dropCollection("games")
    .then((success) => {
        // console.log(success);
    })
    .catch((err) => console.log(err));

db.createCollection("games")
    .then((success) => {
        // console.log(success);
    })
    .catch((err) => console.log(err));

app.use(express.json());

const gamesRouter = require("./routes/games");
app.use("/games", gamesRouter);

const { PORT = 1234 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
