import classes from "./Square.module.css";
import * as pieceImages from "../assets/pieceImages";

export default function Square({ index, setInput, color, piece, pieceColor, disabled }) {
    return (
        <button
            className={(index[0] + index[1]) % 2 ? classes.square_0 : classes.square_1}
            onClick={() => setInput(index)}
            style={{ backgroundColor: color }}
            disabled={disabled}
        >
            <img src={pieceImages[pieceColor + piece]} className={classes.image} />
        </button>
    );
}
