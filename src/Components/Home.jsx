import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "./Topbar";
import classes from "./Home.module.css";

export default function Home() {
    const [start, setStart] = useState(false);
    const [player, setPlayer] = useState(null);
    const [computer, setComputer] = useState(null);
    const [time, setTime] = useState(null);
    const colorOn = "rgba(8, 141, 3, 0.75)";

    function changeOptionColor(variable, value) {
        return { backgroundColor: variable === value ? colorOn : "" };
    }

    useEffect(() => {
        if (player !== null && computer !== null && time !== null) {
            setStart(true);
        }
    }, [player, computer, time]);

    return (
        <div>
            <Topbar />
            <div className={classes.options}>
                <button onClick={() => setPlayer(0)} className={classes.option} style={changeOptionColor(player, 0)}>
                    White
                </button>
                <button onClick={() => setPlayer(1)} className={classes.option} style={changeOptionColor(player, 1)}>
                    Black
                </button>
            </div>
            <div className={classes.options}>
                <button onClick={() => setComputer(false)} className={classes.option} style={changeOptionColor(computer, false)}>
                    Human
                </button>
                <button onClick={() => setComputer(true)} className={classes.option} style={changeOptionColor(computer, true)}>
                    Computer
                </button>
            </div>
            <div className={classes.options}>
                <button onClick={() => setTime(1)} className={classes.option} style={changeOptionColor(time, 1)}>
                    1 minute
                </button>
                <button onClick={() => setTime(5)} className={classes.option} style={changeOptionColor(time, 5)}>
                    5 minutes
                </button>
                <button onClick={() => setTime(10)} className={classes.option} style={changeOptionColor(time, 10)}>
                    10 minutes
                </button>
            </div>
            <div className={classes.options}>
                {start ? (
                    <Link to={`game/${player}/${computer}/${time}`} className={classes.link} style={{ backgroundColor: colorOn }}>
                        Start Game
                    </Link>
                ) : (
                    <button className={classes.option}>Start Game</button>
                )}
            </div>
        </div>
    );
}
