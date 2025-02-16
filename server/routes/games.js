const express = require("express");
const router = express.Router();
const { Board } = require("../dynamics/board");
const Game = require("../models/game");

module.exports = (io) => {
    const rooms = {};
    const sockets = {};

    function joinRoom(room, socket, cb) {
        if (!rooms[room]) {
            rooms[room] = [null, null];
        }

        if (sockets[socket.id] !== room) {
            const index = rooms[room].indexOf(null);
            if (index !== -1) {
                rooms[room][index] = socket.id;
                sockets[socket.id] = room;
                cb(index);
            } else {
                rooms[room][index] = socket.id;
                sockets[socket.id] = room;
                cb(null);
            }
        }
    }

    function leaveRoom(room, socket) {
        if (rooms[room]) {
            const index = rooms[room].indexOf(socket.id);
            if (index !== -1) {
                rooms[room][index] = null;
                delete sockets[socket.id];
            }
        }
    }

    io.on("connection", (socket) => {
        socket.on("join-room", async (room, cb) => {
            socket.join(room);
            joinRoom(room, socket, cb);
        });

        socket.on("leave-room", (room) => {
            socket.leave(room);
            leaveRoom(room, socket);
        });

        socket.on("disconnect", () => {
            const room = sockets[socket.id];
            socket.leave(room);
            leaveRoom(room, socket);
        });
    });

    router.get("/:id", getGame, (req, res) => {
        const turn = req.query.turn || res.game.board.turn;
        const resObject = { ...res.game._doc };
        resObject.board = resObject.board.history[turn];

        return res.status(200).json(resObject);
    });

    async function getGame(req, res, next) {
        let game;
        try {
            game = await Game.findById(req.params.id);
            if (game === null) {
                return res.status(404).json({ message: "cannot find game" });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

        res.game = game;
        next();
    }

    router.patch("/:id", getGame, async (req, res) => {
        const { move, takeback } = req.body;
        let game = new Board();
        game = game.restore(res.game.board);
        if (move) {
            game.makeMove(...move);
        }
        if (takeback) {
            game = game.revert(takeback);
        }
        try {
            res.game.board = game;
            const updatedGame = await res.game.save();
            const turn = game.turn;
            io.to(updatedGame.id).emit("move", updatedGame.board.history[turn]);
            res.json(updatedGame.board.history[turn]);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

    router.delete("/", (req, res) => {});

    router.get("/", async (req, res) => {
        try {
            const games = await Game.find();
            res.json(games);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    router.post("/", async (req, res) => {
        const { player, timeLimit, depth } = req.body;
        const board = new Board();
        board.setupBoard();

        const game = new Game({
            board: board,
            timeLimit: timeLimit,
            player: player,
            depth: depth,
        });

        try {
            const newGame = await game.save();
            res.status(201).json(newGame.id);
        } catch (err) {
            res.status(400).send({ message: err.message });
        }
        const games = await Game.find();
        io.emit("games", games);
    });

    return router;
};
