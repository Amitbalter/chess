const express = require("express");
const app = express();
app.use(express.json());
const { Board } = require("./dynamics/board.js");

// const users = require("./routes/users");
// app.use("/api/users", users);

// const dummyBoard = new board();
// dummyBoard.setPiece(0, 3, new king("white"));
// dummyBoard.setPiece(7, 3, new king("black"));
// dummyBoard.setPiece(3, 0, new bishop("white"));
// dummyBoard.setPiece(6, 6, new knight("black"));
// dummyBoard.setPiece(4, 5, new knight("white"));
// dummyBoard.setPiece(6, 7, new pawn("white"));
// dummyBoard.setPiece(1, 7, new pawn("black"));
// dummyBoard.setPiece(0, 5, new rook("white"));
// dummyBoard.history[0] = JSON.parse(JSON.stringify(dummyBoard));
// dummyBoard.updateBoardMoves(0);
// dummyBoard.setupBoard();

const data = {};

app.get("/api/game/:id", (req, res) => {
    const { id } = req.params;
    if (data[id] === undefined) {
        const game = new Board();
        game.setupBoard();
        data[id] = game;
    }
    res.status(200).send(data[id]);
});

app.post("/api/game/:id", (req, res) => {
    const { id } = req.params;
    const moves = req.body;
    const game = data[id];
    game.makeMove(...moves);
    res.status(200).send(game.history[game.turn]);
});

app.listen(1234);
