const express = require("express");
const format = require("pg-format");
const router = express.Router();
const db = require("../db/connection");

module.exports = (io) => {
    const rooms = {};
    const sockets = {};

    function joinRoom(room, socket) {
        if (!rooms[room]) {
            rooms[room] = [null, null];
        }

        if (sockets[socket.id] !== room) {
            const index = rooms[room].indexOf(null);
            rooms[room][index] = socket.id;
            sockets[socket.id] = room;
            if (index !== -1) {
                return index;
            } else {
                return null;
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
        socket.on("join-room", (room, cb) => {
            socket.join(room);
            const position = joinRoom(room, socket);

            const gamesQuery = db.query(`SELECT * FROM games WHERE game_id = $1`, [room]);
            const movesQuery = db.query(`SELECT * FROM moves WHERE game_id = $1`, [room]);

            Promise.all([gamesQuery, movesQuery]).then(([gamesRes, movesRes]) => {
                cb(position, gamesRes.rows[0].player, movesRes.rows);
            });
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

        socket.on("makemove", (data) => {
            const room = sockets[socket.id];
            socket.broadcast.emit("move", data);
            db.query(
                format(
                    `INSERT INTO moves 
            (game_id, turn, i1, j1, i2, j2, promoted)
            VALUES %L RETURNING *;`,
                    [[room, data.turn, ...data.move]]
                )
            ).catch((err) => {
                res.status(400).send({ message: err.message });
            });
        });
    });

    router.get("/", async (req, res) => {
        return db
            .query(`SELECT * FROM games;`)
            .then((result) => {
                res.status(200).json(result.rows);
            })
            .catch((err) => {
                res.status(500).json({ message: err.message });
            });
    });

    router.post("/", async (req, res) => {
        const { mode, player, timeLimit, depth } = req.body;

        const queryStr = format(
            `INSERT INTO games 
            (mode, player, time_limit, depth)
            VALUES %L RETURNING *;`,
            [[mode, player, timeLimit, depth]]
        );
        return db
            .query(queryStr)
            .then((result) => {
                res.status(201).json(result.rows[0].game_id);
                io.emit("newgame", result.rows[0]);
            })
            .catch((err) => {
                res.status(400).send({ message: err.message });
            });
    });

    return router;
};
