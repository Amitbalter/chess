import { empty } from "./empty.js";

class piece {
    constructor(color) {
        this.color = color;
        this.castle = "N";
        this.moves = [];
        this.position = [];
    }

    move(i1, j1, i2, j2, board) {
        const square1 = board.array[i1][j1];
        const square2 = board.array[i2][j2];
        const piece = square2.piece;
        const player = this.color === "white" ? 1 : -1;
        if (this.color !== piece.color) {
            this.castle = "N";
            board.doMove(square1, square2);
            return true;
        }
    }

    exposesKing(row, col, board) {
        const [i, j] = this.position;
        const n = this.color === "white" ? 0 : 1;
        const copy = board.replicate();
        const [square1, square2] = [copy.array[i][j], copy.array[row][col]];
        const [piece1, piece2] = [square1.piece, square2.piece];
        if (piece1.label === "P" && piece2.label === "" && j !== col) {
            //enpassant
            copy.setPiece(4 - n, col, new empty());
        }
        copy.doMove(square1, square2);
        copy.updateBoardMoves(1 - n); //update moves of opposite color
        //check if king of same color in check
        if (!copy.kingInCheck(n)) {
            return false;
        } else {
            return true;
        }
    }

    legalmove(row, col, board) {
        if (this.color === ["white", "black"][board.turn % 2]) {
            if (!this.exposesKing(row, col, board)) {
                this.moves.push([row, col].join(""));
            }
        } else this.moves.push([row, col].join(""));
    }
}

export { piece };
