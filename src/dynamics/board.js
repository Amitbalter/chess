import { pawn } from "./pawn.js";
import { rook } from "./rook.js";
import { knight } from "./knight.js";
import { bishop } from "./bishop.js";
import { queen } from "./queen.js";
import { king } from "./king.js";
import { empty } from "./empty.js";
import { piece } from "./piece.js";

class square {
    constructor(color, position, piece) {
        this.color = color;
        this.position = position;
        this.piece = piece;
    }
}

class board {
    constructor() {
        this.array = [];
        for (let i = 0; i < 8; i++) {
            let row = [];
            for (let j = 0; j < 8; j++) {
                row.push(new square(["white", "black"][(i + j) % 2], [i, j], new empty()));
            }
            this.array.push(row);
        }
        this.enPassant = [null, null];
        this.pieces = [[], []];
        this.moves = [[], []];
        this.turn = 0;
        this.state = null;
        this.history = [];
        this.lastMove = null;
        this.promotedPiece = null;
        this.test = 0;
    }

    setupBoard() {
        const whitePieces = [
            new rook("white"),
            new knight("white"),
            new bishop("white"),
            new king("white"),
            new queen("white"),
            new bishop("white"),
            new knight("white"),
            new rook("white"),
        ];
        const blackPieces = [
            new rook("black"),
            new knight("black"),
            new bishop("black"),
            new king("black"),
            new queen("black"),
            new bishop("black"),
            new knight("black"),
            new rook("black"),
        ];
        for (let j = 0; j < 8; j++) {
            this.setPiece(1, j, new pawn("white"));
            this.setPiece(6, j, new pawn("black"));
            this.setPiece(0, j, whitePieces[j]);
            this.setPiece(7, j, blackPieces[j]);
        }

        this.history.push(JSON.parse(JSON.stringify(this)));
        this.updateBoardMoves(0);
    }

    setPiece(i, j, piece) {
        const square = this.array[i][j];
        if (square.piece.label !== "") {
            const color = ["white", "black"].indexOf(square.piece.color);
            const index = this.pieces[color].indexOf(square.piece);
            this.pieces[color].splice(index, 1);
        }
        square.piece = piece; //place piece on square
        piece.position = [i, j]; //update position of piece
        if (piece.label !== "") {
            this.pieces[["white", "black"].indexOf(piece.color)].push(piece); //add piece to board pieces
        }
    }

    doMove(square1, square2) {
        const piece1 = square1.piece;
        const piece2 = square2.piece;
        //removing captured piece from the board
        if (piece2.label !== "") {
            const color = ["white", "black"].indexOf(piece2.color);
            const index = this.pieces[color].indexOf(piece2);
            this.pieces[color].splice(index, 1); //remove piece on square2 from board pieces
        }
        square2.piece = piece1; //move piece from square1 to square2
        piece1.position = square2.position; //update position of piece
        square1.piece = new empty(); //square1 is now empty
    }

    //function that updates all the possible moves on the board
    updateBoardMoves(k) {
        this.moves[k] = [];
        for (let piece of this.pieces[k]) {
            piece.updateMoves(this);
            this.moves[k] = this.moves[k].concat(piece.moves);
        }
        this.moves[k] = [...new Set(this.moves[k])];
    }

    kingInCheck(color) {
        let kingPos = this.pieces[color % 2].find((piece) => piece.label === "K").position.join("");
        if (this.moves[(color + 1) % 2].includes(kingPos)) {
            return true;
        }
        return false;
    }

    replicate() {
        const copy = new board();
        copy.turn = this.turn;
        copy.enPassant = [...this.enPassant];
        copy.state = this.state;
        copy.lastMove = this.lastMove;
        for (let k of [0, 1]) {
            for (let piece of this.pieces[k]) {
                const pieces = {
                    P: new pawn(piece.color),
                    N: new knight(piece.color),
                    B: new bishop(piece.color),
                    R: new rook(piece.color),
                    Q: new queen(piece.color),
                    K: new king(piece.color),
                };
                const copyPiece = pieces[piece.label];
                copyPiece.castle = piece.castle;
                copyPiece.position = [...piece.position];
                copy.pieces[k].push(copyPiece);
                copy.array[copyPiece.position[0]][copyPiece.position[1]].piece = copyPiece;
            }
        }
        return copy;
    }

    restore(turn) {
        const copy = new board();
        const arrangement = this.history[turn];
        copy.turn = arrangement.turn;
        copy.enPassant = [...arrangement.enPassant];
        copy.state = arrangement.state;
        copy.lastMove = arrangement.lastMove;
        for (let k of [0, 1]) {
            for (let piece of arrangement.pieces[k]) {
                const pieces = {
                    P: new pawn(piece.color),
                    N: new knight(piece.color),
                    B: new bishop(piece.color),
                    R: new rook(piece.color),
                    Q: new queen(piece.color),
                    K: new king(piece.color),
                };
                const copyPiece = pieces[piece.label];
                copyPiece.castle = piece.castle;
                copyPiece.position = [...piece.position];
                copy.pieces[k].push(copyPiece);
                copy.array[copyPiece.position[0]][copyPiece.position[1]].piece = copyPiece;
            }
        }
        return copy;
    }

    revert(turns) {
        const copy = this.restore(this.turn - turns);
        copy.history = this.history.slice(0, -turns);
        copy.updateBoardMoves(copy.turn % 2);
        return copy;
    }

    equal(arr) {
        if (JSON.stringify(this.enPassant) !== JSON.stringify(arr.enPassant)) {
            return false;
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece1 = this.array[i][j].piece;
                const piece2 = arr.array[i][j].piece;
                if (piece1.label !== piece2.label) return false;
                else if (piece1.color !== piece2.color) return false;
                else if (piece1.castle !== piece2.castle) return false;
            }
        }
        return true;
    }

    makeMove(i1, j1, i2, j2) {
        const piece1 = this.array[i1][j1].piece;
        if (piece1.move(i1, j1, i2, j2, this)) {
            this.turn++;
            this.enPassant[this.turn % 2] = null;
            this.state = null;
            this.lastMove = [i1, j1, i2, j2];
            this.promotedPiece = null;
            this.moves = [[], []];

            this.updateBoardMoves((this.turn + 1) % 2);
            if (this.kingInCheck(this.turn % 2)) {
                this.moves = [[], []];
                this.updateBoardMoves(this.turn % 2);
                if (this.moves[this.turn % 2].length !== 0) {
                    this.state = "check";
                } else {
                    this.state = "checkmate";
                }
            } else {
                this.moves = [[], []];
                this.updateBoardMoves(this.turn % 2);
                if (this.moves[this.turn % 2].length === 0) {
                    this.state = "stalemate";
                }
            }
            //threefold repetition
            let repetition = 0;
            for (let arr of this.history) {
                if ((arr.turn - this.turn) % 2 === 0) {
                    if (this.equal(arr)) {
                        repetition++;
                    }
                }
            }
            if (repetition === 2) {
                this.state = "threefold";
            }

            const arrangement = JSON.parse(JSON.stringify(this));
            arrangement.history = [];
            this.history.push(arrangement);
        }
    }

    valuation() {
        const values = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
        let valuation = 0;
        for (let k of [0, 1]) {
            for (let piece of this.pieces[k]) {
                valuation += (1 - 2 * k) * values[piece.label];
            }
        }
        return valuation;
    }
}

export { board };
