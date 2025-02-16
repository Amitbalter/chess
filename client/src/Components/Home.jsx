import React, { useEffect, useRef, useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import classes from "./Home.module.css";
import { SocketContext } from "./SocketContext";

export default function Home() {
    const socket = useContext(SocketContext);

    const navigate = useNavigate();

    const [create, setCreate] = useState(null);
    const [start, setStart] = useState(false);

    const [player, setPlayer] = useState(null);
    const [mode, setMode] = useState(null);
    const [timeLimit, setTimeLimit] = useState(null);
    const [depth, setDepth] = useState(null);

    const [id, setId] = useState(null);
    const [games, setGames] = useState([]);

    function changeOptionColor(variable, value) {
        return { backgroundColor: variable === value ? "rgba(8, 141, 3, 0.75)" : "" };
    }

    useEffect(() => {
        if (create === true) {
            setId(null);
        } else if (create === false) {
            setPlayer(null);
            setMode(null);
            setTimeLimit(null);
            setDepth(null);

            socket.on("games", (games) => setGames(games));
            api.get("/games")
                .then((data) => setGames(data.data))
                .catch((err) => console.log(err));
        }
        setStart(false);
    }, [create]);

    useEffect(() => {
        if (player !== null && timeLimit !== null && ((mode === "computer" && depth !== null) || mode === "online" || mode === "offline")) {
            setStart(true);
        } else {
            setStart(false);
        }
    }, [player, mode, timeLimit, depth]);

    async function handleStart() {
        if (start) {
            if (id) navigate(`game/${id}`);
            else {
                const response = await api.post("/games", {
                    player: player,
                    timeLimit: timeLimit,
                    depth: depth,
                });

                navigate(`game/${response.data}`);
            }
        }
    }

    return (
        <div>
            <Topbar />
            <div className={classes.mainoptions}>
                <button onClick={() => setCreate(true)} className={classes.mainoption} style={changeOptionColor(create, true)}>
                    New Game
                </button>
                <button onClick={() => setCreate(false)} className={classes.mainoption} style={changeOptionColor(create, false)}>
                    Join Game
                </button>
            </div>

            {create === true ? (
                <div className={classes.optionmenu}>
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
                                setMode("offline");
                                setDepth(null);
                            }}
                            className={classes.option}
                            style={changeOptionColor(mode, "offline")}
                        >
                            Offline
                        </button>
                        <button
                            onClick={() => {
                                setMode("online");
                                setDepth(null);
                            }}
                            className={classes.option}
                            style={changeOptionColor(mode, "online")}
                        >
                            Online
                        </button>
                        <button
                            onClick={() => {
                                setMode("computer");
                            }}
                            className={classes.option}
                            style={changeOptionColor(mode, "computer")}
                        >
                            Computer
                        </button>
                    </div>
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
                    {mode === "computer" ? (
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
                </div>
            ) : (
                <></>
            )}

            {create === false ? (
                <>
                    <div className={classes.gamelog}>
                        <div className={classes.header}>
                            <p align="center">player</p>
                            <p align="center">Time Limit</p>
                        </div>
                        {games.map((game, index) => (
                            <button
                                key={index}
                                className={classes.game}
                                onClick={() => {
                                    setId(game._id);
                                    setStart(true);
                                }}
                                style={changeOptionColor(id, game._id)}
                            >
                                <p>{["White", "Black"][game.player]}</p>
                                <p>{game.timeLimit}</p>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <></>
            )}
            {create === null ? <div className={classes.optionmenu}></div> : <></>}
            <div className={classes.mainoptions}>
                <button className={classes.mainoption} style={changeOptionColor(start, true)} onClick={() => handleStart()}>
                    Start Game
                </button>
            </div>
        </div>
    );
}
