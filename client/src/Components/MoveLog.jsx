import React, { useState, useEffect, useRef } from "react";
import classes from "./MoveLog.module.css";

export default function MoveLog({ realTurn, turn, reCreate }) {
    const movelogRef = useRef(null);
    const [moves, setMoves] = useState([]);
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];

    useEffect(() => {
        if (realTurn > 0) {
            fetch(`/api/game/1`)
                .then((res) => res.json())
                .then((data) => {
                    setMoves(data.movelog);
                });
            movelogRef.current.scrollTop = movelogRef.current.scrollHeight;
        }
    }, [realTurn]);

    return (
        <div className={classes.movelog} ref={movelogRef}>
            <div className={classes.turns}>
                {Array.from({ length: Math.ceil(realTurn / 2) }).map((_, index) => (
                    <p key={index} className={classes.turn}>
                        {index + 1}
                    </p>
                ))}
            </div>
            <div className={classes.moves}>
                {moves.map((move, index) => {
                    return (
                        <button
                            key={index}
                            className={classes.move}
                            style={{ backgroundColor: index + 1 === turn ? "rgba(8, 141, 3, 0.75)" : "" }}
                            onClick={() => reCreate(index + 1)}
                        >
                            {move[2] + " " + letters[7 - move[1]] + `${move[0] + 1}`}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
