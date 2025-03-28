import { BoardInterface } from "./board";
import Piece from "./piece";

export default class Queen extends Piece {
    constructor(color: string) {
        super(color);
        this.label = "Q";
    }

    updateMoves(board: BoardInterface): void {
        const [i, j] = this.position;
        this.moves = [];

        //diagonals
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

        //rows and columns
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
    }
}
