const mongoose = require("mongoose");
const { Board } = require("../dynamics/board");

const gameSchema = new mongoose.Schema({
    board: {
        type: Object,
        required: true,
        default: () => {
            const board = new Board();
            board.setupBoard();
            return board;
        },
    },
    color: {
        type: Number,
        required: true,
    },
    timeLimit: {
        type: Number,
        required: true,
    },
    time: {
        type: Array,
    },
    depth: {
        type: Number,
    },
});

module.exports = mongoose.model("Game", gameSchema);
