import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "./Topbar";
import "./Home.css";

export default function Home() {
    const [start, setStart] = useState(false);

    const [player, setPlayer] = useState(null);
    const [computer, setComputer] = useState(null);
    const [time, setTime] = useState(null);

    useEffect(() => {
        if (player !== null && computer !== null && time !== null) {
            setStart(true);
        }
    }, [player, computer, time]);

    return (
        <div>
            <Topbar />
            <div className="home_options">
                <button onClick={() => setPlayer(0)} className="home_option">
                    White
                </button>
                <button onClick={() => setPlayer(1)} className="home_option">
                    Black
                </button>
            </div>
            <div className="home_options">
                <button onClick={() => setComputer(false)} className="home_option">
                    Human
                </button>
                <button onClick={() => setComputer(true)} className="home_option">
                    Computer
                </button>
            </div>
            <div className="home_options">
                <button onClick={() => setTime(1)} className="home_option">
                    1 minutes
                </button>
                <button onClick={() => setTime(5)} className="home_option">
                    5 minutes
                </button>
                <button onClick={() => setTime(10)} className="home_option">
                    10 minutes
                </button>
            </div>
            <div className="home_options">
                {start ? (
                    <Link to={`game/${player}/${computer}/${time}`} className="home_option">
                        Start Game
                    </Link>
                ) : (
                    <button className="home_option">Start Game</button>
                )}
            </div>
        </div>
    );
}
