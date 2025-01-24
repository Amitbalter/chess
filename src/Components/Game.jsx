import React, { useEffect, useRef, useState } from "react";
import Topbar from "./Topbar";
import { Link, useParams } from "react-router-dom";
import Square from "./Square";
import Timer from "./Timer";
import MoveLog from "./MoveLog";
import { board } from "../dynamics/board";
import { king } from "../dynamics/king";
import { pawn } from "../dynamics/pawn";
import { rook } from "../dynamics/rook";
import { bishop } from "../dynamics/bishop";
import { knight } from "../dynamics/knight";
import { bestMove } from "../dynamics/opponent";
import classes from "./Game.module.css";

export default function Game() {
    const { player, computer, timeLimit, depth } = useParams();

    const [boardColors, setBoardColors] = useState(Array(8).fill(Array(8).fill("")));
    const [boardDisabled, setBoardDisabled] = useState(false);
    const [flip, setFlip] = useState(1 - player);
    const [redoColor, setRedoColor] = useState("");
    const [message, setMessage] = useState("");
    const [time1, setTime1] = useState(60 * timeLimit);
    const [time2, setTime2] = useState(60 * timeLimit);

    const [gameBoard, setGameBoard] = useState(new board());
    const [displayBoard, setDisplayBoard] = useState(new board());

    const colors = ["white", "black"];

    const [i1, seti1] = useState(null);
    const [j1, setj1] = useState(null);
    const [i2, seti2] = useState(null);
    const [j2, setj2] = useState(null);
    const [undo, setUndo] = useState(0);
    const [prev, setPrev] = useState(null);
    const [next, setNext] = useState(0);
    const [restart, setRestart] = useState(0);

    function resetColors() {
        setBoardColors(Array(8).fill(Array(8).fill("")));
    }

    function changeSquareColor(i, j, color) {
        setBoardColors((boardColors) => {
            const copyBoardColors = boardColors.map((row) => [...row]);
            copyBoardColors[[i, 7 - i][flip]][[j, 7 - j][flip]] = color;
            return copyBoardColors;
        });
    }

    function resetInputs() {
        seti1(null);
        seti2(null);
        setj1(null);
        setj2(null);
    }

    function handleTakeback() {
        if (displayBoard.turn === gameBoard.turn) {
            let turns;
            if (computer === "false" && gameBoard.turn >= 1) {
                turns = 1;
            } else if (gameBoard.turn % 2 === Number(player) && gameBoard.turn >= 2) {
                turns = 2;
            }
            if (turns) {
                const dummyboard = gameBoard.revert(turns);
                setGameBoard(dummyboard);
                setDisplayBoard(dummyboard);
                resetInputs();
                setPrev(dummyboard.lastMove);
                setUndo(undo - turns);
            }
        }
    }

    function handleUndo() {
        if (undo > 0) {
            setDisplayBoard(gameBoard.history[undo - 1]);
            setPrev(gameBoard.history[undo - 1].lastMove);
            setBoardDisabled(true);
            setUndo(undo - 1);
            setRedoColor("rgba(8, 141, 3, 0.75)");
            resetInputs();
        }
    }

    function handleRedo() {
        if (undo + 1 <= gameBoard.turn) {
            if (undo + 1 === gameBoard.turn) {
                setBoardDisabled(false);
                setRedoColor("");
            }
            setDisplayBoard(gameBoard.history[undo + 1]);
            setPrev(gameBoard.history[undo + 1].lastMove);
            setUndo(undo + 1);
            resetInputs();
        }
    }

    function generateMove() {
        const move = bestMove(gameBoard, Number(depth));
        if (move) {
            seti1(move[0]);
            setj1(move[1]);
            seti2(move[2]);
            setj2(move[3]);
        }
    }

    function setInput(index) {
        const [i, j] = [index[0], index[1]];
        const row = [i, 7 - i][flip];
        const col = [j, 7 - j][flip];
        //setting input1 and input2
        if (i1 === null) {
            // check correct color according to turn
            if (gameBoard.array[row][col].piece.color === colors[gameBoard.turn % 2]) {
                seti1(row);
                setj1(col);
                setMessage("");
            } else {
                setMessage(`It is ${colors[gameBoard.turn % 2]}'s turn to play`);
            }
        }
        //if second square is same piece of same colour then change input1 to new piece
        else if (i1 !== null) {
            if (gameBoard.array[i1][j1].piece.moves.includes([row, col].join(""))) {
                seti2(row);
                setj2(col);
            } else if (gameBoard.array[row][col].piece.color === colors[gameBoard.turn % 2]) {
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
        const dummyBoard = new board();
        // dummyBoard.setPiece(0, 3, new king("white"));
        // dummyBoard.setPiece(3, 0, new bishop("white"));
        // dummyBoard.setPiece(7, 3, new king("black"));
        // dummyBoard.setPiece(6, 6, new knight("black"));
        // dummyBoard.setPiece(4, 5, new knight("white"));
        // dummyBoard.setPiece(3, 4, new pawn("black"));
        // dummyBoard.setPiece(0, 5, new rook("white"));
        // dummyBoard.history[0] = JSON.parse(JSON.stringify(dummyBoard));
        // dummyBoard.updateBoardMoves(0);
        dummyBoard.setupBoard();
        setGameBoard(dummyBoard); //updating with dummy board to trigger re-render
        setNext(1 - next);
        setBoardDisabled(false);
        setRedoColor("");
        setMessage("");
        setPrev(null);
        setTime1(60 * timeLimit);
        setTime2(60 * timeLimit);
        setDisplayBoard(dummyBoard.history[0]);
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

    useEffect(() => {
        if (computer === "true" && gameBoard.turn % 2 !== Number(player)) {
            generateMove();
        }
    }, [next]);

    //coloring current piece and moves in green if human move
    useEffect(() => {
        if ((computer === "true" && gameBoard.turn % 2 === Number(player)) || computer === "false") {
            if (i1 !== null && j1 !== null) {
                let piece1 = gameBoard.array[i1][j1].piece;
                changeSquareColor(i1, j1, "rgb(5, 136, 0)");
                for (let move of piece1.moves) {
                    const [k, l] = [Number(move[0]), Number(move[1])];
                    changeSquareColor(k, l, "rgba(8, 141, 3, 0.75)");
                }
            }
        }
    }, [i1, j1, flip]);

    //making the move and updating the board according to the outcome
    useEffect(() => {
        if (i2 !== null && j2 !== null) {
            gameBoard.makeMove(i1, j1, i2, j2);
            setUndo(gameBoard.turn);
            setDisplayBoard(gameBoard.history[gameBoard.turn]);
            setPrev([i1, j1, i2, j2]);
            resetInputs();
            setMessage("");
            // if (comp === null) setFlip(1-flip)
        }
        if (computer === "true") {
            setBoardDisabled(gameBoard.turn % 2 !== Number(player));
        }
    }, [i2, j2]);

    useEffect(() => {
        let king1 = displayBoard.pieces[displayBoard.turn % 2].find((piece) => piece.label === "K");
        let king2 = displayBoard.pieces[(displayBoard.turn + 1) % 2].find((piece) => piece.label === "K");
        if (king1 && king2) {
            let [k, l] = king1.position;
            let [m, n] = king2.position;
            switch (displayBoard.state) {
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
    }, [displayBoard.turn, displayBoard.state, i1, j1, flip]);

    return (
        <>
            <Topbar />
            <div className={classes.game}>
                <div className={classes.left}>
                    {timeLimit !== "false" ? (
                        <>
                            <Timer turn={gameBoard.turn} player={[0, 1][flip]} time={[time1, time2][flip]} setTime={[setTime1, setTime2][flip]} />
                            <Timer
                                turn={gameBoard.turn}
                                player={[0, 1][1 - flip]}
                                time={[time1, time2][1 - flip]}
                                setTime={[setTime1, setTime2][1 - flip]}
                            />
                        </>
                    ) : (
                        <></>
                    )}
                </div>
                <div className={classes.board}>
                    {Array.from({ length: 8 }).map((_, row) =>
                        Array.from({ length: 8 }).map((_, col) => (
                            <Square
                                key={[row, col]}
                                index={[row, col]}
                                setInput={setInput}
                                color={boardColors[row][col]}
                                piece={displayBoard.array[[row, 7 - row][flip]][[col, 7 - col][flip]].piece.label}
                                pieceColor={displayBoard.array[[row, 7 - row][flip]][[col, 7 - col][flip]].piece.color}
                                disabled={boardDisabled}
                            />
                        ))
                    )}
                </div>
                <div className={classes.right}>
                    <MoveLog game={gameBoard} displayTurn={displayBoard.turn} />
                    <div className={classes.options}>
                        <button className={classes.option} onClick={handleTakeback}>
                            Takeback
                        </button>
                        <button className={classes.option} onClick={handleUndo}>
                            Undo
                        </button>
                        <button className={classes.option} onClick={handleRedo} style={{ backgroundColor: redoColor }}>
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
                <p className={classes.message}>{`${message}`}</p>
            </div>
        </>
    );
}
