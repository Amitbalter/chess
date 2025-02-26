import Rook from "./rook.js";
import Knight from "./knight.js";
import Bishop from "./bishop.js";
import Queen from "./queen.js";
import Empty from "./empty.js";
import Piece from "./piece.js";

export default class Pawn extends Piece {
    constructor(color) {
        super(color);
        this.label = "P";
    }

    updateMoves(board) {
        const [i, j] = this.position;
        this.moves = [];
        const player = this.color === "white" ? 0 : 1;
        const dir = 1 - 2 * player;

        //if pawn on first file add two moves
        if (i === [1, 6][player]) {
            for (let s of [1, 2]) {
                const [row, col] = [i + dir * s, j];
                let piece = board.array[row][col].piece;
                if (piece.label !== "") {
                    break;
                } else {
                    this.legalmove(row, col, board);
                }
            }
        }

        //if pawn on other file add one move
        else {
            const [row, col] = [i + dir, j];
            let piece = board.array[row][col].piece;
            if (piece.label === "") {
                this.legalmove(row, col, board);
            }
        }

        //capturing
        for (let s of [-1, 1]) {
            const [row, col] = [i + dir, j + s];
            if (col >= 0 && col <= 7) {
                let piece = board.array[row][col].piece;
                if (piece.color !== this.color && piece.label !== "") {
                    this.legalmove(row, col, board);
                } else if (col === board.enPassant[1 - player] && row === 5 - 3 * player) {
                    this.legalmove(row, col, board);
                }
            }
        }
    }

    move(i1, j1, i2, j2, board) {
        const piece = board.array[i2][j2].piece;
        const player = this.color === "white" ? 0 : 1;

        if (i1 + [2, -2][player] === i2) {
            board.enPassant[player] = j1;
            board.doMove(i1, j1, i2, j2);
        } else if (piece.label === "" && j1 !== j2) {
            board.setPiece([4, 3][player], j2, new Empty());
            board.doMove(i1, j1, i2, j2);
        } else if (i2 === [7, 0][player]) {
            const pieces = {
                Q: new Queen(this.color),
                R: new Rook(this.color),
                B: new Bishop(this.color),
                N: new Knight(this.color),
            };
            board.setPiece(i1, j1, new Empty());
            board.setPiece(i2, j2, pieces[board.promoted]);
        } else if (this.color !== piece.color) {
            board.doMove(i1, j1, i2, j2);
        }
    }
}
