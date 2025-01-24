import React, { useEffect, useRef, useState } from "react";
import classes from "./Clock.module.css";

export default function Clock({ turn, flip, timeLimit, restart }) {
    const [time1, setTime1] = useState(60 * timeLimit);
    const [time2, setTime2] = useState(60 * timeLimit);

    useEffect(() => {
        setTime1(60 * timeLimit);
        setTime2(60 * timeLimit);
    }, [restart]);

    return (
        <>
            {timeLimit !== "false" ? (
                Array.from({ length: 2 }).map((_, index) => {
                    const orientation = [flip, 1 - flip][index];
                    return (
                        <Timer
                            turn={turn}
                            player={[0, 1][orientation]}
                            time={[time1, time2][orientation]}
                            setTime={[setTime1, setTime2][orientation]}
                        />
                    );
                })
            ) : (
                <></>
            )}
        </>
    );
}

function Timer({ turn, player, time, setTime }) {
    function displayTime(t) {
        const minutes = Math.floor(t / 60);
        const seconds = t % 60;
        return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
    }

    useEffect(() => {
        let counter = 0;
        if (turn % 2 === player) {
            const intervalID = setInterval(() => {
                if (time - counter > 0) {
                    counter++;
                    setTime(time - counter);
                }
            }, 1000);

            return () => {
                clearInterval(intervalID);
            };
        }
    }, [turn]);

    return (
        <div>
            <div className={classes.timer}>
                <p>{displayTime(time)}</p>
            </div>
        </div>
    );
}
