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
            <button onClick={() => setPlayer(0)} className="homepageLink">
                White
            </button>
            <button onClick={() => setPlayer(1)} className="homepageLink">
                Black
            </button>
            <button onClick={() => setComputer(false)} className="homepageLink">
                Human
            </button>
            <button onClick={() => setComputer(true)} className="homepageLink">
                Computer
            </button>
            <button onClick={() => setTime(1)} className="homepageLink">
                1 minutes
            </button>
            <button onClick={() => setTime(5)} className="homepageLink">
                5 minutes
            </button>
            <button onClick={() => setTime(10)} className="homepageLink">
                10 minutes
            </button>
            {start ? (
                <Link to={`game/${player}/${computer}/${time}`} className="homepageLink">
                    Start Game
                </Link>
            ) : (
                <button className="homepageLink">Start Game</button>
            )}
        </div>
    );
}
