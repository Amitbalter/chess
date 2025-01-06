import React, { useEffect, useRef } from 'react';
import whitePawn from "./assets/whitePawn.png"
import whiteKnight from "./assets/whiteKnight.png"
import whiteBishop from "./assets/whiteBishop.png"
import whiteRook from "./assets/whiteRook.png"
import whiteKing from "./assets/whiteKing.png"
import whiteQueen from "./assets/whiteQueen.png"
import blackPawn from "./assets/blackPawn.png"
import blackKnight from "./assets/blackKnight.png"
import blackBishop from "./assets/blackBishop.png"
import blackRook from "./assets/blackRook.png"
import blackKing from "./assets/blackKing.png"
import blackQueen from "./assets/blackQueen.png"
import empty from "./assets/empty.png"

const pieceImages = {
                    'white':{
                            'P': whitePawn,
                            'N': whiteKnight,
                            'B': whiteBishop,
                            'R': whiteRook,
                            'Q': whiteQueen,
                            'K': whiteKing
                        },
                    'black':{
                            'P': blackPawn,
                            'N': blackKnight,
                            'B': blackBishop,
                            'R': blackRook,
                            'Q': blackQueen,
                            'K': blackKing
                    },
                    '':{' ':empty}
                 }

export default function Square({addRef, onFocus, index, piece, color}) {
    const buttonRef = useRef(0);

    useEffect(() =>{
        if (buttonRef.current){
            addRef(buttonRef, index)    
        }
    },[])

    function handleClick() {
        if (buttonRef.current) {
            onFocus(buttonRef, index);
        }
    }
    
    return (
        <button
            ref={buttonRef}
            className={`square_${(index[0]+index[1])%2}`}
            onClick={handleClick}
        ><img src= {pieceImages[color][piece]} className = 'image'/></button>
    );
}