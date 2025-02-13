const express = require("express");
const router = express.Router();
const { Board } = require("../dynamics/board");
const Game = require("../models/game");

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
    const { move, takeback, time } = req.body;
    let game = new Board();
    game = game.restore(res.game.board);
    if (move) {
        game.makeMove(...move);
    }
    if (takeback) {
        game = game.revert(takeback);
    }
    try {
        res.game.time = time;
        res.game.board = game;
        const updatedGame = await res.game.save();
        const turn = game.turn;
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
    const { color, timeLimit, depth } = req.body;
    const game = new Game({
        timeLimit: timeLimit,
        color: color,
        depth: depth,
        time: [60 * timeLimit, 60 * timeLimit],
    });

    try {
        const newGame = await game.save();
        res.status(201).json(newGame.id);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
