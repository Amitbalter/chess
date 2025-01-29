import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Topbar from "./Topbar";
import Square from "./Square";
import Clock from "./Clock";
import MoveLog from "./MoveLog";
import { Board } from "../dynamics/board";
import { bestMove } from "../dynamics/opponent";
import classes from "./Game.module.css";

export default function Game() {
    const { player, computer, timeLimit, depth } = useParams();

    const [boardColors, setBoardColors] = useState(Array(8).fill(Array(8).fill("")));
    const [boardDisabled, setBoardDisabled] = useState(false);
    const [flip, setFlip] = useState(1 - player);
    const [redoColor, setRedoColor] = useState("");
    const [message, setMessage] = useState("");

    const [board, setBoard] = useState(null);

    const colors = ["white", "black"];

    const [i1, seti1] = useState(null);
    const [j1, setj1] = useState(null);
    const [i2, seti2] = useState(null);
    const [j2, setj2] = useState(null);
    const [undo, setUndo] = useState(0);
    const [next, setNext] = useState(0);
    const [prev, setPrev] = useState(null);
    const [restart, setRestart] = useState(0);
    const [promotion, setPromotion] = useState(false);

    useEffect(() => {
        fetch("/api/game/1")
            .then((res) => res.json())
            .then((data) => {
                setBoard(data);
            });
    }, []);

    function resetColors() {
        setBoardColors(Array(8).fill(Array(8).fill("")));
    }

    function changeSquareColor(i, j, color) {
        setBoardColors((boardColors) => {
            const copyboardColors = boardColors.map((row) => [...row]);
            copyboardColors[[i, 7 - i][flip]][[j, 7 - j][flip]] = color;
            return copyboardColors;
        });
    }

    function resetInputs() {
        seti1(null);
        seti2(null);
        setj1(null);
        setj2(null);
    }

    function setInput(index) {
        const [i, j] = [index[0], index[1]];
        const row = [i, 7 - i][flip];
        const col = [j, 7 - j][flip];
        //setting input1 and input2
        if (i1 === null) {
            // check correct color according to turn
            if (board.array[row][col].piece.color === colors[board.turn % 2]) {
                seti1(row);
                setj1(col);
                setMessage("");
            } else {
                setMessage(`It is ${colors[board.turn % 2]}'s turn to play`);
            }
        }
        //if second square is same piece of same colour then change input1 to new piece
        else if (i1 !== null) {
            const piece1 = board.array[i1][j1].piece;
            if (piece1.moves.includes([row, col].join(""))) {
                if (piece1.label === "P" && row === [7, 0][board.turn % 2]) {
                    setPromotion(true);
                    setBoardDisabled(true);
                }
                seti2(row);
                setj2(col);
            } else if (board.array[row][col].piece.color === colors[board.turn % 2]) {
                if (i1 !== row || j1 !== col) {
                    seti1(row);
                    setj1(col);
                } else {
                    seti1(null);
                    seti1(null);
                }
            } else {
                seti1(null);
                seti1(null);
            }
        }
    }

    useEffect(() => {
        resetColors();
        setNext(1 - next);
        setBoardDisabled(false);
        setRedoColor("");
        setMessage("");
    }, [restart]);

    //coloring previous move in blue
    useEffect(() => {
        resetColors();
        if (prev !== null) {
            changeSquareColor(prev[0], prev[1], "rgb(72, 111, 197)");
            changeSquareColor(prev[2], prev[3], "rgba(68, 114, 212, 0.8)");
            setNext(1 - next);
        }
    }, [prev, i1, j1, flip]);

    //coloring current piece and moves in green if human move
    useEffect(() => {
        if ((computer === "true" && board.turn % 2 === Number(player)) || computer === "false") {
            if (i1 !== null && j1 !== null) {
                let piece1 = board.array[i1][j1].piece;
                changeSquareColor(i1, j1, "rgb(5, 136, 0)");
                // console.log(piece1);
                for (let move of piece1.moves) {
                    const [k, l] = [Number(move[0]), Number(move[1])];
                    changeSquareColor(k, l, "rgba(8, 141, 3, 0.75)");
                }
            }
        }
    }, [i1, j1, flip]);

    //making the move and updating the board according to the outcome
    useEffect(() => {
        if (i2 !== null && j2 !== null && !promotion) {
            fetch("/api/game/1", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify([i1, j1, i2, j2]),
            })
                .then((res) => res.json())
                .then((data) => {
                    setBoard(data);
                    setPrev(data.lastMove);
                    resetInputs();
                })
                .catch((error) => console.error("Error patching data:", error));
            setUndo((undo) => undo + 1);
            // resetColors();
            setMessage("");
            // if (comp === null) setFlip(1-flip)
        }
        if (computer === "true") {
            setBoardDisabled(board.turn % 2 !== Number(player));
        }
    }, [i2, j2, promotion]);

    return (
        <>
            <Topbar />
            <div className={classes.game}>
                <div className={classes.board}>
                    {board ? (
                        Array.from({ length: 8 }).map((_, row) =>
                            Array.from({ length: 8 }).map((_, col) => (
                                <Square
                                    key={[row, col]}
                                    index={[row, col]}
                                    setInput={setInput}
                                    color={boardColors[row][col]}
                                    piece={board.array[[row, 7 - row][flip]][[col, 7 - col][flip]].piece.label}
                                    pieceColor={board.array[[row, 7 - row][flip]][[col, 7 - col][flip]].piece.color}
                                    disabled={boardDisabled}
                                />
                            ))
                        )
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </>
    );
}
