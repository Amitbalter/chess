import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Topbar from "./Topbar";
import Square from "./Square";
import Clock from "./Clock";
import MoveLog from "./MoveLog";
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
    const [next, setNext] = useState(0);
    const [prev, setPrev] = useState(null);
    const [turn, setTurn] = useState(null);
    const [realTurn, setRealTurn] = useState(null);
    const [restart, setRestart] = useState(0);
    const [promotedPiece, setPromotedPiece] = useState(null);

    useEffect(() => {
        fetch(`/api/game/1`)
            .then((res) => res.json())
            .then((data) => {
                setBoard(data);
                setTurn(data.turn);
                setRealTurn(data.turn);
                setPrev(data.lastMove);
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

    function takeback() {
        if (turn === realTurn) {
            let turns;
            if (computer === "false" && realTurn >= 1) {
                turns = 1;
            } else if (realTurn % 2 === Number(player) && realTurn >= 2) {
                turns = 2;
            }
            if (turns) {
                fetch("/api/game/1", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ takeback: turns }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        setBoard(data);
                        setPrev(data.lastMove);
                        setTurn(data.turn);
                        setRealTurn(data.turn);
                        resetInputs();
                    })
                    .catch((error) => console.error("Error patching data:", error));
            }
        }
    }

    function reCreate(turn) {
        fetch(`/api/game/1?turn=${turn}`)
            .then((res) => res.json())
            .then((data) => {
                setBoard(data);
                setPrev(data.lastMove);
                setTurn(turn);
            });
    }

    // function generateMove() {
    //     const move = bestMove(gameBoard, Number(depth));
    //     if (move) {
    //         seti1(move[0]);
    //         setj1(move[1]);
    //         seti2(move[2]);
    //         setj2(move[3]);
    //         gameBoard.promotedPiece = move[4];
    //     }
    // }

    function setInput(index) {
        const [i, j] = [index[0], index[1]];
        const row = [i, 7 - i][flip];
        const col = [j, 7 - j][flip];
        //setting input1 and input2
        if (i1 === null) {
            // check correct color according to turn
            if (board.array[row][col].piece.color === colors[realTurn % 2]) {
                seti1(row);
                setj1(col);
                setMessage("");
            } else {
                setMessage(`It is ${colors[realTurn % 2]}'s turn to play`);
            }
        }
        //if second square is same piece of same colour then change input1 to new piece
        else if (i1 !== null) {
            const piece1 = board.array[i1][j1].piece;
            if (piece1.moves.includes([row, col].join(""))) {
                if (piece1.label === "P" && row === [7, 0][realTurn % 2]) {
                    setPromotedPiece("required");
                    setBoardDisabled(true);
                }
                seti2(row);
                setj2(col);
            } else if (board.array[row][col].piece.color === colors[realTurn % 2]) {
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
        setTurn(null);
        setRealTurn(null);
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

    // useEffect(() => {
    //     if (computer === "true" && realTurn % 2 !== Number(player)) {
    //         generateMove();
    //     }
    // }, [next]);

    //coloring current piece and moves in green if human move
    useEffect(() => {
        if ((computer === "true" && realTurn % 2 === Number(player)) || computer === "false") {
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
        if (i2 !== null && j2 !== null && promotedPiece != "required") {
            fetch("/api/game/1", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ move: [i1, j1, i2, j2, promotedPiece] }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setBoard(data);
                    setPrev(data.lastMove);
                    setTurn(data.turn);
                    setRealTurn(data.turn);
                    resetInputs();
                })
                .catch((error) => console.error("Error patching data:", error));
            setMessage("");

            // if (comp === null) setFlip(1-flip)
        }
        if (computer === "true") {
            setBoardDisabled(realTurn % 2 !== Number(player));
        }
    }, [i2, j2, promotedPiece]);

    useEffect(() => {
        if (turn !== null) {
            let king1 = board.pieces[turn % 2].find((piece) => piece.label === "K");
            let king2 = board.pieces[(turn + 1) % 2].find((piece) => piece.label === "K");
            if (king1 && king2) {
                let [k, l] = king1.position;
                let [m, n] = king2.position;
                switch (board.state) {
                    case "check":
                        setMessage(`The ${king1.color} king is in check`);
                        if (k !== i1 || l !== j1) {
                            changeSquareColor(k, l, "rgb(218, 137, 33)");
                        }
                        break;
                    case "checkmate":
                        setMessage(`Checkmate, ${king2.color} wins`);
                        changeSquareColor(k, l, "purple");
                        setBoardDisabled(true);
                        break;
                    case "stalemate":
                        setMessage("Stalemate");
                        changeSquareColor(k, l, "pink");
                        changeSquareColor(m, n, "pink");
                        setBoardDisabled(true);
                        break;
                    case "threefold":
                        setMessage("Threefold repetition");
                        changeSquareColor(k, l, "yellow");
                        changeSquareColor(m, n, "yellow");
                        setBoardDisabled(true);
                        break;
                }
            }
        }
    }, [turn, i1, j1, flip]);

    useEffect(() => {
        if (turn === realTurn) {
            setBoardDisabled(false);
            setRedoColor("");
        } else {
            setBoardDisabled(true);
            setRedoColor("rgba(8, 141, 3, 0.75)");
        }
        resetInputs();
    }, [turn]);

    return (
        <>
            <Topbar />
            <div className={classes.game}>
                <div className={classes.left}>
                    <Clock turn={realTurn} flip={flip} timeLimit={timeLimit} restart={restart} />
                </div>
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
                <div className={classes.right}>
                    <MoveLog realTurn={realTurn} turn={turn} reCreate={reCreate} />
                    <div className={classes.options}>
                        <button className={classes.option} onClick={takeback}>
                            Takeback
                        </button>
                        <button
                            className={classes.option}
                            onClick={() => {
                                if (turn > 0) reCreate(turn - 1);
                            }}
                        >
                            Undo
                        </button>
                        <button
                            className={classes.option}
                            onClick={() => {
                                if (turn < realTurn) reCreate(turn + 1);
                            }}
                            style={{ backgroundColor: redoColor }}
                        >
                            Redo
                        </button>
                        <button className={classes.option} onClick={() => setFlip(1 - flip)}>
                            Flip Board
                        </button>
                        <button className={classes.option} onClick={() => setRestart(restart + 1)}>
                            Restart
                        </button>
                        <button
                            className={classes.option}
                            onClick={() => {
                                setMessage(`${colors[player]} resigns, game is over`);
                                setRestart(restart + 1);
                            }}
                        >
                            Resign
                        </button>
                    </div>
                </div>
            </div>
            <div className={classes.console}>
                {promotedPiece === "required" ? (
                    <div className={classes.promotion}>
                        {["Q", "R", "B", "N"].map((label) => {
                            return (
                                <Square
                                    key={label}
                                    index={label}
                                    setInput={() => {
                                        setPromotedPiece(label);
                                    }}
                                    color="transparent"
                                    piece={label}
                                    pieceColor={colors[realTurn % 2]}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className={classes.message}>{`${message}`}</p>
                )}
            </div>
        </>
    );
}
