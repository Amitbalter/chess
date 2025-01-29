const { Piece } = require("./piece.js");

class Queen extends Piece {
    constructor(color) {
        super(color);
        this.label = "Q";
    }

    updateMoves(board) {
        const [i, j] = this.position;
        this.moves = [];
        //diagonals
        for (let k1 of [-1, 1]) {
            for (let k2 of [-1, 1]) {
                for (let s = 1; s <= Math.min((7 * (k1 + 1)) / 2 - k1 * i, (7 * (k2 + 1)) / 2 - k2 * j); s++) {
                    const [row, col] = [i + k1 * s, j + k2 * s];
                    let piece = board.array[row][col].piece;
                    if (piece.label === "") {
                        this.legalmove(row, col, board);
                    } else if (piece.label !== "") {
                        if (piece.color !== this.color) {
                            this.legalmove(row, col, board);
                            break;
                        } else break;
                    }
                }
            }
        }
        //rows and columns
        for (let k1 of [0, 1]) {
            for (let k2 of [-1, 1]) {
                for (let s = 1; s + k2 * [i, j][k1] <= (7 * (1 + k2)) / 2; s++) {
                    const [row, col] = [i + (1 - k1) * k2 * s, j + k1 * k2 * s];
                    let piece = board.array[row][col].piece;
                    if (piece.label === "") {
                        this.legalmove(row, col, board);
                    } else if (piece.label !== "") {
                        if (piece.color !== this.color) {
                            this.legalmove(row, col, board);
                            break;
                        } else break;
                    }
                }
            }
        }
    }
}

module.exports = { Queen };
