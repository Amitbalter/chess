import React, { useEffect, useContext, useState, lazy } from "react";
import { Link, useParams } from "react-router-dom";
import Topbar from "./Topbar";
import Square from "./Square";
import Clock from "./Clock";
import MoveLog from "./MoveLog";
import classes from "./Game.module.css";

import { SocketContext } from "./SocketContext";
import Board from "../dynamics/board";

export default function Game() {
    const [mode, setMode] = useState(null);
    const [timeLimit, setTimeLimit] = useState(null);
    const [restart, setRestart] = useState(0);
    const [start, setStart] = useState(false);
    const [clock, setClock] = useState(0);

    const socket = useContext(SocketContext);
    const { id } = useParams();

    const [player, setPlayer] = useState(null);
    const [computer, setComputer] = useState("false");

    const [boardColors, setBoardColors] = useState(Array(8).fill(Array(8).fill("")));
    const [boardDisabled, setBoardDisabled] = useState(false);
    const [flip, setFlip] = useState(1);
    const [redoColor, setRedoColor] = useState("");
    const [message, setMessage] = useState("");
    const [moves, setMoves] = useState([]);

    const [board, setBoard] = useState(null);

    const colors = ["white", "black"];

    const [game, setGame] = useState(null);
    const [move, setMove] = useState(null);
    const [takeback, setTakeback] = useState(null);

    const [i1, seti1] = useState(null);
    const [j1, setj1] = useState(null);
    const [i2, seti2] = useState(null);
    const [j2, setj2] = useState(null);
    const [prev, setPrev] = useState(null);
    const [turn, setTurn] = useState(null);
    const [realTurn, setRealTurn] = useState(null);
    const [promoted, setPromoted] = useState(null);

    function handleMove(data) {
        setPrev(data.lastMove);
        setTurn(data.turn);
        setRealTurn(data.turn);
        setMoves(data.movelog);
        setBoard(data);
        setBoardDisabled(false);
        resetInputs();
        setMessage("");
    }

    useEffect(() => {
        socket.emit("join-room", id, (mode, timeLimit, position, player, moves) => {
            setMode(mode);
            setTimeLimit(timeLimit);
            if (mode === "online" && position !== null) {
                setPlayer([player, 1 - player][position]);
                setFlip([1 - player, player][position]);
            } else if (mode !== "online" && position === 0) {
                setPlayer(0);
            }
            const dummy = new Board();
            dummy.setupBoard();
            for (let move of moves) {
                const { i1, j1, i2, j2, promoted } = move;
                dummy.makeMove(i1, j1, i2, j2, promoted);
            }
            setGame(dummy);
            handleMove(dummy);
        });

        socket.on("move", (data) => {
            setMove(data.move);
        });

        socket.on("takeback", (data) => {
            setTakeback(data.takeback);
        });

        socket.on("start", () => {
            setStart(true);
        });

        socket.on("clock", () => {
            setClock((clock) => 1 - clock);
        });

        return () => {
            socket.emit("leave-room", id);
            socket.off("move");
            socket.off("takeback");
            socket.off("start");
            socket.off("clock");
        };
    }, []);

    useEffect(() => {
        if (move) {
            game.makeMove(...move);
            handleMove(game);
        }
    }, [move]);

    useEffect(() => {
        if (takeback) {
            game.restore(realTurn - takeback);
            handleMove(game);
        }
        setTakeback(null);
    }, [takeback]);

    function resetInputs() {
        seti1(null);
        seti2(null);
        setj1(null);
        setj2(null);
    }

    function handleTakeback() {
        if (turn === realTurn) {
            let turns;
            if (computer === "false" && realTurn >= 1) {
                turns = 1;
            } else if (realTurn % 2 === Number(player) && realTurn >= 2) {
                turns = 2;
            }
            if (turns) {
                setTakeback(turns);
                socket.emit("makeTakeback", { takeback: turns });
            }
        }
    }

    function reCreate(turn) {
        setBoard(game.history[turn]);
        setPrev(game.history[turn].lastMove);
        setTurn(turn);
    }

    function handleRestart() {
        setTakeback(realTurn);
        socket.emit("makeTakeback", { takeback: realTurn });
        setRestart((restart) => restart + 1);
    }

    function setInput(index) {
        if ((mode === "online" && player === realTurn % 2) || (mode !== "online" && player === 0)) {
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
                        setPromoted("required");
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
    }

    //making the move and updating the board according to the outcome
    useEffect(() => {
        if (i2 !== null && j2 !== null && promoted != "required") {
            setMove([i1, j1, i2, j2, promoted]);
            socket.emit("makemove", { turn: realTurn, move: [i1, j1, i2, j2, promoted] });

            // if (comp === null) setFlip(1-flip)
        }
        if (computer === "true") {
            setBoardDisabled(realTurn % 2 !== Number(player));
        }
    }, [i2, j2, promoted]);

    //changing colors on board
    useEffect(() => {
        const dummyColors = Array.from({ length: 8 }, () => Array(8).fill(""));
        if (prev !== null) {
            dummyColors[prev[0]][prev[1]] = "rgb(72, 111, 197)";
            dummyColors[prev[2]][prev[3]] = "rgba(68, 114, 212, 0.8)";
        }
        if ((computer === "true" && realTurn % 2 === Number(player)) || computer === "false") {
            if (i1 !== null && j1 !== null) {
                let piece1 = board.array[i1][j1].piece;
                dummyColors[i1][j1] = "rgb(5, 136, 0)";
                for (let move of piece1.moves) {
                    const [k, l] = [Number(move[0]), Number(move[1])];
                    dummyColors[k][l] = "rgba(8, 141, 3, 0.75)";
                }
            }
        }
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
                            dummyColors[k][l] = "rgb(218, 137, 33)";
                        }
                        break;
                    case "checkmate":
                        setMessage(`Checkmate, ${king2.color} wins`);
                        dummyColors[k][l] = "purple";
                        setBoardDisabled(true);
                        break;
                    case "stalemate":
                        setMessage("Stalemate");
                        dummyColors[k][l] = "pink";
                        dummyColors[m][n] = "pink";
                        setBoardDisabled(true);
                        break;
                    case "threefold":
                        setMessage("Threefold repetition");
                        dummyColors[k][l] = "yellow";
                        dummyColors[m][n] = "yellow";
                        setBoardDisabled(true);
                        break;
                }
            }
        }
        setBoardColors(dummyColors);
    }, [prev, i1, j1, flip]);

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
                    <Clock clock={clock} flip={flip} timeLimit={timeLimit} start={start} restart={restart} />
                </div>
                <div className={classes.board}>
                    {board ? (
                        Array.from({ length: 8 }).map((_, row) =>
                            Array.from({ length: 8 }).map((_, col) => (
                                <Square
                                    key={[row, col]}
                                    index={[row, col]}
                                    setInput={setInput}
                                    color={boardColors[[row, 7 - row][flip]][[col, 7 - col][flip]]}
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
                    <MoveLog moves={moves} realTurn={realTurn} turn={turn} reCreate={reCreate} />
                    <div className={classes.options}>
                        <button className={classes.option} onClick={handleTakeback}>
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
                        <button className={classes.option} onClick={() => handleRestart()}>
                            Restart
                        </button>
                        <button
                            className={classes.option}
                            onClick={() => {
                                setMessage(`${colors[player]} resigns, game is over`);
                                handleRestart();
                            }}
                        >
                            Resign
                        </button>
                    </div>
                </div>
            </div>
            <div className={classes.console}>
                {promoted === "required" ? (
                    <div className={classes.promotion}>
                        {["Q", "R", "B", "N"].map((label) => {
                            return (
                                <Square
                                    key={label}
                                    index={label}
                                    setInput={() => {
                                        setPromoted(label);
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

// function generateMove() {
//     const move = bestMove(gameBoard, Number(depth));
//     if (move) {
//         seti1(move[0]);
//         setj1(move[1]);
//         seti2(move[2]);
//         setj2(move[3]);
//         gameBoard.promoted = move[4];
//     }
// }

// useEffect(() => {
//     if (computer === "true" && realTurn % 2 !== Number(player)) {
//         generateMove();player
//     }
// }, [next]);
