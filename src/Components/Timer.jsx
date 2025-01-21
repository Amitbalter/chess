import React, { useEffect, useRef, useState } from "react";

export default function Timer({ turn, player, time }) {
    const timerRef = useRef(null);
    const [timer, setTimer] = useState(time - 1);

    function displayTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerRef.current.innerText = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
    }
    useEffect(() => {
        displayTime(time);
    }, []);

    useEffect(() => {
        let counter = 0;
        if (turn % 2 === player) {
            const intervalID = setInterval(() => {
                if (timer - counter >= 0) {
                    displayTime(timer - counter);
                    counter++;
                }
            }, 1000);

            return () => {
                clearInterval(intervalID);
                setTimer(timer - counter);
            };
        }
    }, [turn]);

    return (
        <div>
            <div className="timer">
                <p ref={timerRef}></p>
            </div>
        </div>
    );
}
