import React, { useEffect, useRef } from "react";
import classes from "./Square.module.css";
import whitePawn from "../assets/whitePawn.png";
import whiteKnight from "../assets/whiteKnight.png";
import whiteBishop from "../assets/whiteBishop.png";
import whiteRook from "../assets/whiteRook.png";
import whiteKing from "../assets/whiteKing.png";
import whiteQueen from "../assets/whiteQueen.png";
import blackPawn from "../assets/blackPawn.png";
import blackKnight from "../assets/blackKnight.png";
import blackBishop from "../assets/blackBishop.png";
import blackRook from "../assets/blackRook.png";
import blackKing from "../assets/blackKing.png";
import blackQueen from "../assets/blackQueen.png";
import empty from "../assets/empty.png";

const pieceImages = {
    white: {
        P: whitePawn,
        N: whiteKnight,
        B: whiteBishop,
        R: whiteRook,
        Q: whiteQueen,
        K: whiteKing,
    },
    black: {
        P: blackPawn,
        N: blackKnight,
        B: blackBishop,
        R: blackRook,
        Q: blackQueen,
        K: blackKing,
    },
    "": { "": empty },
};

export default function Square({ index, setInput, color, piece, pieceColor, disabled }) {
    return (
        <button
            className={(index[0] + index[1]) % 2 ? classes.square_0 : classes.square_1}
            onClick={() => setInput(index)}
            style={{ backgroundColor: color }}
            disabled={disabled}
        >
            <img src={pieceImages[pieceColor][piece]} className={classes.image} />
        </button>
    );
}
