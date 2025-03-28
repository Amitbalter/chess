import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import classes from "./Home.module.css";
import { SocketContext } from "./SocketContext";

export default function Home() {
    const socket = useContext(SocketContext);

    const navigate = useNavigate();

    const [option, setOption] = useState(null);
    const [start, setStart] = useState(false);

    const [player, setPlayer] = useState(null);
    const [mode, setMode] = useState(null);
    const [timeLimit, setTimeLimit] = useState(null);
    const [depth, setDepth] = useState(null);

    const [id, setId] = useState(null);
    const [games, setGames] = useState({});

    function changeOptionColor(variable, value) {
        return { backgroundColor: variable === value ? "rgba(8, 141, 3, 0.75)" : "" };
    }

    useEffect(() => {
        socket.emit("games", (data) => {
            setGames(() =>
                data.reduce((acc, element) => {
                    acc[element.game_id] = element;
                    return acc;
                }, {})
            );
        });

        socket.on("gamenew", (newgame) => {
            setGames((games) => ({
                ...games,
                [newgame.game_id]: newgame,
            }));
        });

        socket.on("gamestate", (data) => {
            // console.log(data);
            setGames((games) => ({
                ...games,
                [data.game_id]: { ...games[data.game_id], state: data.state },
            }));
        });

        return () => {
            socket.off("gamenew");
            socket.off("gameactive");
        };
    }, []);

    // useEffect(() => {
    //     console.log(games);
    // }, [games]);

    useEffect(() => {
        setId(null);
        setPlayer(null);
        setMode(null);
        setTimeLimit(null);
        setDepth(null);
        setStart(false);
    }, [option]);

    useEffect(() => {
        if (player !== null && ((mode === "computer" && depth !== null) || (mode && timeLimit !== null))) {
            setStart(true);
        } else {
            setStart(false);
        }
    }, [player, mode, timeLimit, depth]);

    async function handleStart() {
        if (start) {
            if (id) navigate(`game/${id}`);
            else {
                console.log("start");
                socket.emit(
                    "creategame",
                    {
                        mode: mode,
                        player: player,
                        timeLimit: timeLimit || 0,
                        depth: depth,
                    },
                    (id) => {
                        navigate(`game/${id}`);
                    }
                );
            }
        }
    }

    return (
        <div>
            <Topbar />
            <div className={classes.mainoptions}>
                <button onClick={() => setOption("new")} className={classes.mainoption} style={changeOptionColor(option, "new")}>
                    New Game
                </button>
                <button onClick={() => setOption("join")} className={classes.mainoption} style={changeOptionColor(option, "join")}>
                    Join Game
                </button>
                <button onClick={() => setOption("spectate")} className={classes.mainoption} style={changeOptionColor(option, "spectate")}>
                    Spectate
                </button>
            </div>

            {option === "new" ? (
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
                                setTimeLimit(null);
                            }}
                            className={classes.option}
                            style={changeOptionColor(mode, "computer")}
                        >
                            Computer
                        </button>
                    </div>
                    {mode === "computer" ? (
                        <div className={classes.options}>
                            <button onClick={() => setDepth(1)} className={classes.option} style={changeOptionColor(depth, 1)}>
                                Easy
                            </button>
                            <button onClick={() => setDepth(2)} className={classes.option} style={changeOptionColor(depth, 2)}>
                                Medium
                            </button>
                            <button onClick={() => setDepth(3)} className={classes.option} style={changeOptionColor(depth, 3)}>
                                Hard
                            </button>
                        </div>
                    ) : (
                        <div className={classes.options}>
                            <button onClick={() => setTimeLimit(0)} className={classes.option} style={changeOptionColor(timeLimit, 0)}>
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
                    )}
                </div>
            ) : null}

            {option === "join" ? (
                <div className={classes.gamelog}>
                    <div className={classes.header}>
                        <p align="center">player</p>
                        <p align="center">Time Limit</p>
                        <p align="center">Mode</p>
                    </div>
                    {Object.values(games).map((game) =>
                        game.state === "waiting" ? (
                            <button
                                key={game.game_id}
                                className={classes.game}
                                onClick={() => {
                                    setId(game.game_id);
                                    setStart(true);
                                }}
                                style={changeOptionColor(id, game.game_id)}
                            >
                                <p>{["White", "Black"][game.player]}</p>
                                <p>{game.time_limit}</p>
                                <p>{game.mode}</p>
                            </button>
                        ) : null
                    )}
                </div>
            ) : null}
            {option === "spectate" ? (
                <div className={classes.gamelog}>
                    <div className={classes.header}>
                        <p align="center">player</p>
                        <p align="center">Time Limit</p>
                        <p align="center">Mode</p>
                    </div>
                    {Object.values(games).map((game) =>
                        game.state === "active" ? (
                            <button
                                key={game.game_id}
                                className={classes.game}
                                onClick={() => {
                                    setId(game.game_id);
                                    setStart(true);
                                }}
                                style={changeOptionColor(id, game.game_id)}
                            >
                                <p>{["White", "Black"][game.player]}</p>
                                <p>{game.time_limit}</p>
                                <p>{game.mode}</p>
                            </button>
                        ) : null
                    )}
                </div>
            ) : null}
            {option === null ? <div className={classes.optionmenu}></div> : <></>}
            <div className={classes.mainoptions}>
                <button className={classes.mainoption} style={changeOptionColor(start, true)} onClick={() => handleStart()}>
                    Start Game
                </button>
            </div>
        </div>
    );
}
