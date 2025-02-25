import Empty from "./empty";

export default class Piece {
    constructor(color) {
        this.color = color;
        this.castle = "N";
        this.moves = [];
        this.position = [];
    }

    move(i1, j1, i2, j2, board) {
        if (this.color !== board.array[i2][j2].piece.color) {
            this.castle = "N";
            board.doMove(i1, j1, i2, j2);
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
            copy.setPiece(4 - n, col, new Empty());
        }
        copy.doMove(i, j, row, col);
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
