import classes from "./MoveLog.module.css";

export default function MoveLog({ game, displayTurn, reCreate }) {
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
    return (
        <div className={classes.movelog}>
            <div className={classes.turns}>
                {Array.from({ length: Math.ceil(game.turn / 2) }).map((_, index) => (
                    <p className={classes.turn}>{index + 1}</p>
                ))}
            </div>
            <div className={classes.moves}>
                {Array.from({ length: game.turn }).map((_, index) => {
                    const i = game.history[index + 1].lastMove[2];
                    const j = game.history[index + 1].lastMove[3];
                    const piece = game.history[index + 1].array[i][j].piece.label;
                    return (
                        <button
                            className={classes.move}
                            style={{ backgroundColor: index + 1 === displayTurn ? "rgba(8, 141, 3, 0.75)" : "" }}
                            onClick={() => reCreate(index + 1)}
                        >
                            {piece + " " + letters[7 - j] + `${i + 1}`}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
