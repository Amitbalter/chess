const { Piece } = require("./piece.js");

class Rook extends Piece {
    constructor(color) {
        super(color);
        this.label = "R";
        this.castle = "Y";
    }

    updateMoves(board) {
        const [i, j] = this.position;
        this.moves = [];
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
        if (this.castle === "Y") {
            const row = 7 * ["white", "black"].indexOf(this.color);
            let king = board.array[row][3].piece;
            if (king.castle === "Y") {
                const n = (2 * j) / 7 - 1; // n is +1 or -1 depending on Rook
                if (i === row && Math.abs(n) === 1) {
                    let empty = true;
                    for (let s = 1; n * (3 + n * s) <= j - 1; s++) {
                        if (board.array[row][3 + n * s].piece.label !== "") {
                            empty = false;
                        }
                    }
                    if (empty) {
                        const k = ["white", "black"].indexOf(this.color);
                        if (k === board.turn % 2) {
                            board.updateBoardMoves(1 - k);
                            let check = false;
                            for (let s = 0; s < 3; s++) {
                                if (board.moves[1 - k].includes([row, 3 + n * s].join(""))) {
                                    check = true;
                                    break;
                                }
                            }
                            for (let s = 0; s < 4; s++) {
                                let pawn = board.array[[1, 6][k]][3 + n * s].piece; //separate check for pawns
                                if (pawn.label === "P" && pawn.color !== this.color) {
                                    check = true;
                                    break;
                                }
                            }
                            if (!check) {
                                this.moves.push([row, 3].join(""));
                            }
                        }
                    }
                }
            }
        }
    }

    move(i1, j1, i2, j2, board) {
        const square1 = board.array[i1][j1];
        const square2 = board.array[i2][j2];
        const piece = square2.piece;
        const player = -2 * ["white", "black"].indexOf(this.color) + 1;
        if (this.color !== piece.color) {
            this.castle = "N";
            board.doMove(square1, square2);
            return true;
        } else {
            const index = ["K", "R"].indexOf(piece.label);
            const row = 7 * ["white", "black"].indexOf(this.color);
            const side = (2 * [j1, j2][index]) / 7 - 1;
            board.doMove([square1, square2][index], board.array[row][3 + side]);
            board.doMove([square1, square2][(index + 1) % 2], board.array[row][3 + 2 * side]);
            this.castle = "N";
            piece.castle = "N";
            return true;
        }
    }
}

module.exports = { Rook };
