import Pawn from "./pawn.js";
import Rook from "./rook.js";
import Knight from "./knight.js";
import Bishop from "./bishop.js";
import Queen from "./queen.js";
import King from "./king.js";
import Empty, { EmptyInterface } from "./empty.js";
import Piece, { PieceInterface } from "./piece.js";

interface SquareInterface {
    color: string;
    position: number[];
    piece: PieceInterface | EmptyInterface;
}

export interface BoardInterface {
    array: SquareInterface[][];
    enPassant: (number | null)[];
    pieces: { [key: string]: { [key: string]: PieceInterface } };
    moves: (string | null)[][];
    turn: number;
    state: string | null;
    history: BoardInterface[];
    lastMove: number[] | null;
    promoted: string | null;
    movelog: [number, number, string][];
    king: (string | null)[];
    setupBoard(): void;
    setPiece(i: number, j: number, piece1: PieceInterface | EmptyInterface): void;
    doMove(i1: number, j1: number, i2: number, j2: number): void;
    updateBoardMoves(k: number): void;
    kingInCheck(color: number): boolean;
    duplicate(source: BoardInterface, target: BoardInterface): void;
    replicate(): BoardInterface;
    restore(turn: number): void;
    equal(arr: BoardInterface): boolean;
    makeMove(i1: number, j1: number, i2: number, j2: number, promoted: string | null): void;
}

class Square implements SquareInterface {
    color: string;
    position: number[];
    piece: PieceInterface | EmptyInterface;

    constructor(color: string, position: number[], piece: EmptyInterface) {
        this.color = color;
        this.position = position;
        this.piece = piece;
    }
}

export default class Board implements BoardInterface {
    array: SquareInterface[][];
    enPassant: (number | null)[];
    pieces: { [key: string]: { [key: string]: PieceInterface } };
    moves: (string | null)[][];
    turn: number;
    state: string | null;
    history: BoardInterface[];
    lastMove: number[] | null;
    promoted: string | null;
    movelog: [number, number, string][];
    king: (string | null)[];

    constructor() {
        this.array = Array.from({ length: 8 }).map((_, i) =>
            Array.from({ length: 8 }).map((_, j) => {
                return new Square(["white", "black"][(i + j) % 2], [i, j], new Empty());
            })
        );
        this.enPassant = [null, null];
        this.pieces = { white: {}, black: {} };
        this.moves = [[], []];
        this.turn = 0;
        this.state = null;
        this.history = [];
        this.lastMove = null;
        this.promoted = null;
        this.movelog = [];
        this.king = [null, null];
    }

    setupBoard() {
        const pieces = ["white", "black"].map((color) => {
            return [
                new Rook(color),
                new Knight(color),
                new Bishop(color),
                new King(color),
                new Queen(color),
                new Bishop(color),
                new Knight(color),
                new Rook(color),
            ];
        });

        for (let j = 0; j < 8; j++) {
            this.setPiece(1, j, new Pawn("white"));
            this.setPiece(6, j, new Pawn("black"));
            this.setPiece(0, j, pieces[0][j]);
            this.setPiece(7, j, pieces[1][j]);
        }

        this.updateBoardMoves(0);
        this.history.push(JSON.parse(JSON.stringify(this)));
    }

    setPiece(i: number, j: number, piece1: PieceInterface | EmptyInterface): void {
        const piece2 = this.array[i][j].piece;
        if (piece2.label !== "") {
            delete this.pieces[piece2.color][`${i}${j}`];
        }
        this.array[i][j].piece = piece1; //place piece on square
        if (piece1 instanceof Piece) {
            piece1.position = [i, j]; //update position of piece
            this.pieces[piece1.color][`${i}${j}`] = piece1; //add piece to board pieces
            if (piece1.label === "K") {
                this.king[piece1.color === "white" ? 0 : 1] = `${i}${j}`;
            }
        }
    }

    doMove(i1: number, j1: number, i2: number, j2: number): void {
        this.setPiece(i2, j2, this.array[i1][j1].piece);
        this.setPiece(i1, j1, new Empty());
    }

    //function that updates all the possible moves on the board
    updateBoardMoves(k: number): void {
        this.moves[k] = [];
        for (let pos in this.pieces[["white", "black"][k]]) {
            const piece = this.pieces[["white", "black"][k]][pos];
            piece.updateMoves(this);
            this.moves[k] = this.moves[k].concat(piece.moves);
        }
        this.moves[k] = [...new Set(this.moves[k])];
    }

    kingInCheck(color: number): boolean {
        return this.moves[(color + 1) % 2].includes(this.king[color % 2]);
    }

    duplicate(source: BoardInterface, target: BoardInterface): void {
        target.turn = source.turn;
        target.enPassant = [...source.enPassant];
        target.state = source.state;
        target.king = [...source.king];

        for (let k of [0, 1]) {
            for (let pos in source.pieces[["white", "black"][k]]) {
                const piece = source.pieces[["white", "black"][k]][pos];
                const pieces = {
                    P: new Pawn(piece.color),
                    N: new Knight(piece.color),
                    B: new Bishop(piece.color),
                    R: new Rook(piece.color),
                    Q: new Queen(piece.color),
                    K: new King(piece.color),
                };
                const copyPiece = pieces[piece.label];
                copyPiece.castle = piece.castle;
                copyPiece.position = [...piece.position];
                target.pieces[["white", "black"][k]][piece.position.join("")] = copyPiece;
                target.array[copyPiece.position[0]][copyPiece.position[1]].piece = copyPiece;
            }
        }
    }

    replicate(): BoardInterface {
        const copy = new Board();
        this.duplicate(this, copy);
        return copy;
    }

    restore(turn: number): void {
        const arrangement = this.history[turn];

        this.pieces = { white: {}, black: {} };
        this.moves = [[], []];
        this.history = this.history.slice(0, this.turn + 1);
        this.movelog = [...arrangement.movelog];
        this.lastMove = arrangement.lastMove;

        this.array = Array.from({ length: 8 }).map((_, i) =>
            Array.from({ length: 8 }).map((_, j) => {
                return new Square(["white", "black"][(i + j) % 2], [i, j], new Empty());
            })
        );
        this.duplicate(arrangement, this);
        this.updateBoardMoves(this.turn % 2);
    }

    equal(arr: BoardInterface): boolean {
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

    makeMove(i1: number, j1: number, i2: number, j2: number, promoted: string | null): void {
        this.promoted = promoted;
        const piece1 = this.array[i1][j1].piece as PieceInterface;
        piece1.move(i1, j1, i2, j2, this);

        this.turn++;
        this.enPassant[this.turn % 2] = null;
        this.state = null;
        this.lastMove = [i1, j1, i2, j2];
        this.movelog.push([i2, j2, piece1.label]);
        this.promoted = null;
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
