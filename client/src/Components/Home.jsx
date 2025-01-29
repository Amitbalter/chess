import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "./Topbar";
import classes from "./Home.module.css";
import Users from "./User";

export default function Home() {
    const [start, setStart] = useState(false);
    const [player, setPlayer] = useState(null);
    const [computer, setComputer] = useState(null);
    const [depth, setDepth] = useState(null);
    const [timeLimit, setTimeLimit] = useState(null);
    const colorOn = "rgba(8, 141, 3, 0.75)";

    function changeOptionColor(variable, value) {
        return { backgroundColor: variable === value ? colorOn : "" };
    }

    useEffect(() => {
        if (player !== null && timeLimit !== null) {
            if (computer === true && depth !== null) setStart(true);
            else if (computer === false) setStart(true);
            else setStart(false);
        }
    }, [player, computer, timeLimit, depth]);

    return (
        <div>
            <Topbar />
            {/* <Users /> */}
            <div className={classes.options}>
                <button onClick={() => setPlayer(0)} className={classes.option} style={changeOptionColor(player, 0)}>
                    White
                </button>
                <button onClick={() => setPlayer(1)} className={classes.option} style={changeOptionColor(player, 1)}>
                    Black
                </button>
            </div>
            <div className={classes.options}>
                <button
                    onClick={() => {
                        setComputer(false);
                        setDepth(null);
                    }}
                    className={classes.option}
                    style={changeOptionColor(computer, false)}
                >
                    Human
                </button>
                <button onClick={() => setComputer(true)} className={classes.option} style={changeOptionColor(computer, true)}>
                    Computer
                </button>
            </div>
            {computer ? (
                <div className={classes.options}>
                    <button onClick={() => setDepth(0)} className={classes.option} style={changeOptionColor(depth, 0)}>
                        Easy
                    </button>
                    <button onClick={() => setDepth(1)} className={classes.option} style={changeOptionColor(depth, 1)}>
                        Medium
                    </button>
                    <button onClick={() => setDepth(2)} className={classes.option} style={changeOptionColor(depth, 2)}>
                        Hard
                    </button>
                </div>
            ) : (
                <></>
            )}
            <div className={classes.options}>
                <button onClick={() => setTimeLimit(false)} className={classes.option} style={changeOptionColor(timeLimit, false)}>
                    No limit
                </button>
                <button onClick={() => setTimeLimit(1)} className={classes.option} style={changeOptionColor(timeLimit, 1)}>
                    1 minute
                </button>
                <button onClick={() => setTimeLimit(5)} className={classes.option} style={changeOptionColor(timeLimit, 5)}>
                    5 minutes
                </button>
                <button onClick={() => setTimeLimit(10)} className={classes.option} style={changeOptionColor(timeLimit, 10)}>
                    10 minutes
                </button>
            </div>
            <div className={classes.options}>
                {start ? (
                    <Link to={`game/${player}/${computer}/${timeLimit}/${depth}`} className={classes.link} style={{ backgroundColor: colorOn }}>
                        Start Game
                    </Link>
                ) : (
                    <button className={classes.option}>Start Game</button>
                )}
            </div>
        </div>
    );
}
