const http = require("http");
const seed = require("./db/seeds/seed");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const { instrument } = require("@socket.io/admin-ui");

const app = express();
const PORT = process.env.PORT || 1234;

const server = http.createServer(app);

const allowedOrigins = ["http://localhost:3000", "https://admin.socket.io", "https://chess-sz7n.onrender.com"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});

instrument(io, {
    auth: false,
    mode: "development",
});

const gamesRouter = require("./routes/games")(io);
app.use("/games", gamesRouter);

server.listen(PORT, () => console.log(`Listening on ${PORT}...`));
