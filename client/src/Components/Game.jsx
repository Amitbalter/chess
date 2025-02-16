import React, { useEffect, useContext, useState, lazy } from "react";
import api from "../api";
import { Link, useParams } from "react-router-dom";
import Topbar from "./Topbar";
import Square from "./Square";
import Clock from "./Clock";
import MoveLog from "./MoveLog";
import classes from "./Game.module.css";
import { SocketContext } from "./SocketContext";

export default function Game() {
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

    const [i1, seti1] = useState(null);
    const [j1, setj1] = useState(null);
    const [i2, seti2] = useState(null);
    const [j2, setj2] = useState(null);
    const [prev, setPrev] = useState(null);
    const [turn, setTurn] = useState(null);
    const [realTurn, setRealTurn] = useState(null);
    const [promotedPiece, setPromotedPiece] = useState(null);

    function handleMove(data) {
        setBoard(data);
        setPrev(data.lastMove);
        setTurn(data.turn);
        setRealTurn(data.turn);
        setMoves(data.movelog);
        setBoardDisabled(false);
        resetInputs();
        setMessage("");
    }

    useEffect(() => {
        socket.emit("join-room", id, async (position) => {
            try {
                const response = await api.get(`/games/${id}`);
                const player = response.data.player;
                handleMove(response.data.board);
                if (position !== null) {
                    setPlayer([player, 1 - player][position]);
                    setFlip([1 - player, player][position]);
                }
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("move", (data) => handleMove(data));

        return () => {
            socket.emit("leave-room", id);
            socket.off("move");
        };
    }, []);

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
                api.patch(`/games/${id}`, { takeback: turns });
            }
        }
    }

    function reCreate(turn) {
        api.get(`/games/${id}?turn=${turn}`).then((response) => {
            setBoard(response.data.board);
            setPrev(response.data.board.lastMove);
            setTurn(turn);
        });
    }

    function setInput(index) {
        if (player === realTurn % 2) {
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
    }

    function restart() {
        api.patch(`/games/${id}`, { takeback: realTurn });
    }

    //making the move and updating the board according to the outcome
    useEffect(() => {
        if (i2 !== null && j2 !== null && promotedPiece != "required") {
            api.patch(`/games/${id}`, { move: [i1, j1, i2, j2, promotedPiece] });

            // if (comp === null) setFlip(1-flip)
        }
        if (computer === "true") {
            setBoardDisabled(realTurn % 2 !== Number(player));
        }
    }, [i2, j2, promotedPiece]);

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
                    {/* <Clock turn={realTurn} flip={flip} time1={time1} time2={time2} setTime1={setTime1} setTime2={setTime2} restart={restart} /> */}
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
                        <button className={classes.option} onClick={() => restart()}>
                            Restart
                        </button>
                        <button
                            className={classes.option}
                            onClick={() => {
                                setMessage(`${colors[player]} resigns, game is over`);
                                restart();
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

// useEffect(() => {
//     if (computer === "true" && realTurn % 2 !== Number(player)) {
//         generateMove();player
//     }
// }, [next]);
