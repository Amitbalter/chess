import Piece from "./piece";

export default class Bishop extends Piece {
    constructor(color) {
        super(color);
        this.label = "B";
    }

    updateMoves(board) {
        const [i, j] = this.position;
        this.moves = [];
        for (let k1 of [-1, 1]) {
            for (let k2 of [-1, 1]) {
                let [row, col] = [i + k1, j + k2];
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
                    row += k1;
                    col += k2;
                }
            }
        }
    }
}
