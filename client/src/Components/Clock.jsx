import React, { useEffect, useRef, useState } from "react";
import classes from "./Clock.module.css";

export default function Clock({ turn, flip, time1, time2, restart }) {
    function displayTime(t) {
        const minutes = Math.floor(t / 60);
        const seconds = t % 60;
        return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
    }

    return (
        <>
            {time1 ? (
                Array.from({ length: 2 }).map((_, index) => {
                    const orientation = [flip, 1 - flip][index];
                    return (
                        <div key={index} className={classes.timer}>
                            <p>{displayTime([time1, time2][orientation])}</p>
                        </div>
                    );
                })
            ) : (
                <></>
            )}
        </>
    );
}
