import { piece } from "./piece.js";

class king extends piece {
    constructor(color) {
        super(color);
        this.label = "K";
        this.castle = "Y";
    }

    updateMoves(board) {
        const [i, j] = this.position;
        this.moves = [];
        for (let k1 of [-1, 0, 1]) {
            for (let k2 of [-1, 0, 1]) {
                const [row, col] = [i + k1, j + k2];
                if (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
                    let piece = board.array[row][col].piece;
                    if (piece.color !== this.color) {
                        this.legalmove(row, col, board);
                    }
                }
            }
        }
        if (this.castle === "Y") {
            const row = 7 * ["white", "black"].indexOf(this.color);
            for (let n of [-1, 1]) {
                let rook = board.array[row][(7 * (n + 1)) / 2].piece;
                if (rook.castle === "Y") {
                    let empty = true;
                    for (let s = 1; n * (3 + n * s) <= (7 * (n + 1)) / 2 - 1; s++) {
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
                                this.moves.push([row, (7 * (n + 1)) / 2].join(""));
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

export { king };
