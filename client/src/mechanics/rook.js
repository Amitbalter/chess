import Piece from "./piece";

export default class Rook extends Piece {
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
                let [row, col] = [i + k1 * k2, j + (1 - k1) * k2];
                while (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
                    let piece = board.array[row][col].piece;
                    if (piece.label === "") {
                        this.legalmove(row, col, board);
                    } else if (piece.label !== "") {
                        if (piece.color !== this.color) {
                            this.legalmove(row, col, board);
                            break;
                        } else break;
                    }
                    row += k1 * k2;
                    col += (1 - k1) * k2;
                }
            }
        }

        if (this.castle === "Y") {
            const row = this.color === "white" ? 0 : 7;
            let king = board.array[row][3].piece;
            if (king.castle === "Y") {
                if (i === row && (j === 0 || j === 7)) {
                    const n = [-1, 1][j / 7]; // n is +1 or -1 depending on Rook
                    let empty = true;

                    let col = 3 + n;
                    while (col < 7 && col > 0) {
                        if (board.array[row][col].piece.label !== "") {
                            empty = false;
                        }
                        col += n;
                    }

                    if (empty) {
                        const k = row / 7;
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
        const piece = board.array[i2][j2].piece;
        if (this.color !== piece.color) {
            board.doMove(i1, j1, i2, j2);
        } else {
            const row = this.color === "white" ? 0 : 7;
            const dir = [-1, 1][j1 / 7];
            board.doMove(i1, j1, row, 3 + dir);
            board.doMove(i2, j2, row, 3 + 2 * dir);
            piece.castle = "N";
        }
        this.castle = "N";
    }
}
