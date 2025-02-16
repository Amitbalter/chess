const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    board: {
        type: Object,
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
    player: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Game", gameSchema);
