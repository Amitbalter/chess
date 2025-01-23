import classes from "./Moves.module.css";

export default function Moves({ game }) {
    if (game.turn >= 1) {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const moves = Array.from({ length: game.turn }).map((_, index) => {
            const i = game.history[index + 1].lastMove[2];
            const j = game.history[index + 1].lastMove[3];
            const piece = game.history[index + 1].array[i][j].piece.label;
            console.log(game.turn);
            return [piece, letters[7 - j], i + 1];
        });
        return (
            <div className={classes.moves}>
                {Array.from({ length: Math.ceil(game.turn / 2) }).map((_, index) =>
                    2 * index + 1 === game.turn ? (
                        <div className={classes.move}>
                            <p className={classes.turn}>{index + 1} &nbsp;</p>
                            <button className={classes.submove}>{`${moves[2 * index][0]} ${moves[2 * index][1]}${moves[2 * index][2]}`}</button>
                            <button className={classes.submove}></button>
                        </div>
                    ) : (
                        <div className={classes.move}>
                            <p className={classes.turn}>{index + 1} &nbsp;</p>
                            <button className={classes.submove}>{`${moves[2 * index][0]} ${moves[2 * index][1]}${moves[2 * index][2]}`}</button>
                            <button className={classes.submove}>{`${moves[2 * index + 1][0]} ${moves[2 * index + 1][1]}${
                                moves[2 * index + 1][2]
                            }`}</button>
                        </div>
                    )
                )}
            </div>
        );
    } else {
        return <div className={classes.moves}></div>;
    }
}
