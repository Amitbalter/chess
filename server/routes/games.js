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
                const { mode, time_limit, player, depth } = gamesRes.rows[0];
                const moves = movesRes.rows;
                cb(mode, time_limit, depth, position, player, moves);
                if ((mode === "online" && position === 1) || mode !== "online") {
                    io.in(room).emit("start");
                    db.query(
                        `UPDATE games
                            SET state = 'active'
                            WHERE game_id = $1;`,
                        [room]
                    );
                }
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

        socket.on("creategame", (info, cb) => {
            const { mode, player, timeLimit, depth } = info;

            const queryStr = format(
                `INSERT INTO games 
                (state, mode, player, time_limit, depth)
                VALUES %L RETURNING *;`,
                [["waiting", mode, player, timeLimit, depth]]
            );

            db.query(queryStr).then((result) => {
                cb(result.rows[0].game_id);
                socket.broadcast.emit("newgame", result.rows[0]);
            });
        });

        socket.on("games", (cb) => {
            db.query(
                `SELECT * FROM games 
                WHERE state = 'waiting' AND mode = 'online';`
            ).then((result) => {
                cb(result.rows);
            });
        });

        socket.on("makemove", (data) => {
            const room = sockets[socket.id];
            socket.to(room).emit("move", data);
            io.in(room).emit("clock");
            db.query(
                format(
                    `INSERT INTO moves 
                    (game_id, turn, i1, j1, i2, j2, promoted)
                    VALUES %L RETURNING *;`,
                    [[room, data.turn, ...data.move, data.promoted]]
                )
            );
        });

        socket.on("makeTakeback", (data) => {
            const room = sockets[socket.id];
            socket.to(room).emit("takeback", data);
            db.query(
                `DELETE FROM moves
                WHERE ctid IN (
                    SELECT ctid FROM moves
                    WHERE game_id = $1
                    LIMIT $2 OFFSET (SELECT COUNT(*) FROM moves WHERE game_id = $1) - $2
                    );`,
                [room, data.takeback]
            );
        });

        socket.on("state", (data) => {
            const room = sockets[socket.id];
            db.query(
                `UPDATE games
                SET state = $1
                WHERE game_id = $2;`,
                [data.state, room]
            );
        });
    });

    return router;
};
