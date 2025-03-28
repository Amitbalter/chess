import { BoardInterface } from "./board";

function bestPosition(
    board: BoardInterface,
    depth: number,
    alpha: number,
    beta: number
): [number, [number, number, number, number, string | null] | null] {
    const turn = board.turn as number;
    const player = turn % 2;

    if (board.state === "checkmate") {
        console.log("checkmate");
        return [[-1000, 1000][player], null];
    } else if (board.state === "stalemate" || board.state === "threefold") {
        return [0, null];
    }

    if (depth === 0) {
        return [valuation(board), null];
    }

    const possibleMoves = [] as [number, number, number, number, string | null][];
    for (let pos in board.pieces[["white", "black"][player]]) {
        const piece = board.pieces[["white", "black"][player]][pos];
        for (let move of piece.moves) {
            const [i1, j1] = piece.position;
            const [i2, j2] = [Number(move[0]), Number(move[1])];
            if (piece.label === "P" && i2 === [7, 0][player]) {
                for (let promotedPiece of ["Q", "R", "B", "N"]) {
                    possibleMoves.push([i1, j1, i2, j2, promotedPiece]);
                }
            } else possibleMoves.push([i1, j1, i2, j2, null]);
        }
    }

    if (player === 0) {
        let bestVal = -10000;
        let bestMove: [number, number, number, number, string | null] | null = null;
        let count = 0;
        for (let move of possibleMoves) {
            const copy = board.replicate();
            copy.makeMove(...move);
            const val = bestPosition(copy, depth - 1, alpha, beta)[0];

            if (val > bestVal) {
                console.log("player", player, "val", val, "move", move);
                count = 1;
                bestVal = val;
                bestMove = move;
            } else if (val === bestVal) {
                count++;
                if (Math.random() < 1 / count) bestMove = move;
            }

            alpha = Math.max(alpha, val);
            // if (beta <= alpha) break;
        }
        // console.log(bestVal, bestMove);
        return [bestVal, bestMove];
    } else {
        let bestVal = 10000;
        let bestMove: [number, number, number, number, string | null] | null = null;
        let count = 0;
        for (let move of possibleMoves) {
            const copy = board.replicate();
            copy.makeMove(...move);
            const val = bestPosition(copy, depth - 1, alpha, beta)[0];

            if (val < bestVal) {
                console.log("player", player, "val", val, "move", move);
                count = 1;
                bestVal = val;
                bestMove = move;
            } else if (val === bestVal) {
                count++;
                if (Math.random() < 1 / count) bestMove = move;
            }
            beta = Math.min(beta, val);

            // player === 0 ? (alpha = Math.max(alpha, val)) : (beta = Math.min(beta, val));
            // if (beta <= alpha) break;
        }
        // console.log(bestVal, bestMove);
        return [bestVal, bestMove];
    }
}

function valuation(board: BoardInterface): number {
    const values = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
    let valuation = 0;
    for (let k of [0, 1]) {
        for (let pos in board.pieces[["white", "black"][k]]) {
            valuation += (1 - 2 * k) * values[board.pieces[["white", "black"][k]][pos].label];
        }
    }
    return valuation;
}

export default function bestMove(board: BoardInterface, depth: number): [number, number, number, number, string | null] | null {
    return bestPosition(board, depth, -10000, 10000)[1];
}

// if (sign * val > sign * bestVal) {
//     count = 1;
//     bestVal = val;
//     bestMove = move;
// } else if (val === bestVal) {
//     count++;
//     if (Math.random() < 1 / count) bestMove = move;
// }
