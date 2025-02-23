import React, { useEffect, useRef, useState } from "react";
import classes from "./Clock.module.css";

export default function Clock({ turn, flip, timeLimit, restart }) {
    const [time1, setTime1] = useState(60 * timeLimit);
    const [time2, setTime2] = useState(60 * timeLimit);

    return (
        <>
            {timeLimit !== "false" ? (
                Array.from({ length: 2 }).map((_, index) => {
                    const orientation = [flip, 1 - flip][index];
                    return (
                        <Timer
                            key={index}
                            turn={turn}
                            player={[0, 1][orientation]}
                            time={[time1, time2][orientation]}
                            setTime={[setTime1, setTime2][orientation]}
                            timeLimit={timeLimit}
                            restart={restart}
                        />
                    );
                })
            ) : (
                <></>
            )}
        </>
    );
}

function Timer({ turn, player, time, setTime, timeLimit, restart }) {
    function displayTime(t) {
        const minutes = Math.floor(t / 60);
        const seconds = t % 60;
        return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
    }

    useEffect(() => {
        if (turn === 0) setTime(60 * timeLimit);
        if (turn % 2 === player) {
            const intervalID = setInterval(() => {
                setTime((time) => {
                    if (time > 0) {
                        return time - 1;
                    } else {
                        clearInterval(intervalID);
                        return 0;
                    }
                });
            }, 1000);

            return () => {
                clearInterval(intervalID);
            };
        }
    }, [turn, restart]);

    return (
        <div>
            <div className={classes.timer}>
                <p>{displayTime(time)}</p>
            </div>
        </div>
    );
}
