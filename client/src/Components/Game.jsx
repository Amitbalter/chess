import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import Topbar from "./Topbar";
import Square from "./Square";
import Clock from "./Clock";
import MoveLog from "./MoveLog";
import classes from "./Game.module.css";

import { SocketContext } from "./SocketContext";
import Board from "../dynamics/board";
import bestMove from "../dynamics/opponent";

export default function Game() {
    const [mode, setMode] = useState(null);
    const [timeLimit, setTimeLimit] = useState(null);
    const [depth, setDepth] = useState(null);

    const [restart, setRestart] = useState(0);
    const [start, setStart] = useState(false);
    const [clock, setClock] = useState(0);

    const socket = useContext(SocketContext);
    const { id } = useParams();

    const [player, setPlayer] = useState(null);

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

    const [input, setInput] = useState(null);
    const [prev, setPrev] = useState(null);
    const [turn, setTurn] = useState(null);
    const [realTurn, setRealTurn] = useState(null);
    const [promoted, setPromoted] = useState(null);

    function updateBoard(game) {
        setPrev(game.lastMove);
        setTurn(game.turn);
        setRealTurn(game.turn);
        setMoves(game.movelog);
        setBoard(game);
        setBoardDisabled(false);
        setInput(null);
        setMessage("");
    }

    useEffect(() => {
        socket.emit("join-room", id, (mode, timeLimit, depth, position, player, moves) => {
            const dummy = new Board();
            dummy.setupBoard();
            for (let move of moves) {
                const { i1, j1, i2, j2, promoted } = move;
                dummy.makeMove(i1, j1, i2, j2, promoted);
            }
            setGame(dummy);
            updateBoard(dummy);

            setMode(mode);
            setTimeLimit(timeLimit);
            setDepth(depth);

            if (mode === "online" && position !== null) {
                setPlayer([player, 1 - player][position]);
                setFlip([1 - player, player][position]);
            } else if (mode === "offline" && position === 0) {
                setPlayer(0);
            } else if (mode === "computer" && position === 0) {
                setPlayer(player);
                setFlip(1 - player);
            }
        });

        socket.on("move", (data) => {
            setMove(data.move);
            setPromoted(data.promoted);
        });

        socket.on("takeback", (data) => {
            setTakeback(data.takeback);
        });

        socket.on("start", () => {
            setStart(true);
        });

        socket.on("clock", () => {
            console.log("clock");
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
        if (move && promoted !== "required") {
            if ((mode === "online" && player === realTurn % 2) || mode !== "online") {
                socket.emit("makemove", { turn: realTurn, move: move, promoted: promoted });
            }
            game.makeMove(...move, promoted);
            updateBoard(game);
            setMove(null);
            setPromoted(null);
        }
    }, [move, promoted]);

    useEffect(() => {
        if (takeback) {
            game.restore(realTurn - takeback);
            updateBoard(game);
            setTakeback(null);
        }
    }, [takeback]);

    useEffect(() => {
        if (mode === "computer" && player !== realTurn % 2) {
            const move = bestMove(game, depth);
            setMove(move.slice(0, 4));
            setPromoted(move[4]);
        }
    }, [realTurn]);

    function handleTakeback() {
        if (turn === realTurn) {
            let turns;
            if (mode !== "computer" && realTurn >= 1) {
                turns = 1;
            } else if (realTurn % 2 === player && realTurn >= 2) {
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

    function handleInput(index) {
        if ((mode === "online" && player === realTurn % 2) || (mode === "offline" && player === 0) || (mode === "computer" && player === turn % 2)) {
            const [i, j] = [index[0], index[1]];
            const row = [i, 7 - i][flip];
            const col = [j, 7 - j][flip];
            //setting input
            if (input === null) {
                // check correct color according to turn
                if (board.array[row][col].piece.color === colors[realTurn % 2]) {
                    setInput([row, col]);
                    setMessage("");
                } else {
                    setMessage(`It is ${colors[realTurn % 2]}'s turn to play`);
                }
            }
            //if second square is same piece of same colour then change input1 to new piece
            else if (input !== null) {
                const piece1 = board.array[input[0]][input[1]].piece;
                if (piece1.moves.includes([row, col].join(""))) {
                    if (piece1.label === "P" && row === [7, 0][realTurn % 2]) {
                        setPromoted("required");
                        setBoardDisabled(true);
                    }
                    setMove([...input, row, col]);
                } else if (board.array[row][col].piece.color === colors[realTurn % 2]) {
                    if (i !== row || j !== col) {
                        setInput([row, col]);
                    } else {
                        setInput(null);
                    }
                } else {
                    setInput(null);
                }
            }
        }
    }

    //changing colors on board
    useEffect(() => {
        const dummyColors = Array.from({ length: 8 }, () => Array(8).fill(""));
        const [i, j] = input || [null, null];
        if (prev !== null) {
            dummyColors[prev[0]][prev[1]] = "rgb(72, 111, 197)";
            dummyColors[prev[2]][prev[3]] = "rgba(68, 114, 212, 0.8)";
        }
        if ((mode === "computer" && player === realTurn % 2) || mode !== "computer") {
            if (input !== null) {
                let piece1 = board.array[i][j].piece;
                dummyColors[i][j] = "rgb(5, 136, 0)";
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
                        if (k !== i || l !== j) {
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
    }, [prev, input, flip]);

    useEffect(() => {
        if (turn === realTurn) {
            setBoardDisabled(false);
            setRedoColor("");
        } else {
            setBoardDisabled(true);
            setRedoColor("rgba(8, 141, 3, 0.75)");
        }
        setInput(null);
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
                                    setInput={handleInput}
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
