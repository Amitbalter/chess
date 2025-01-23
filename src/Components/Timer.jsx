import React, { useEffect, useRef, useState } from "react";
import classes from "./Timer.module.css";

export default function Timer({ turn, player, time, setTime }) {
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
