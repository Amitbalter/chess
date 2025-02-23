function bestPosition(board, depth) {
    const possibleMoves = [];
    let values = [];
    const player = board.turn % 2;

    for (let piece of board.pieces[player]) {
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

    for (let move of possibleMoves) {
        const copy = board.replicate();
        copy.promotedPiece = move[4];
        copy.makeMove(...move.slice(0, 4));
        if (copy.state === "checkmate") {
            values.push([1000, -1000][player]);
        } else if (copy.state === "stalemate" || "threefold") {
            values.push(0);
        } else {
            if (depth === 0) {
                values.push(valuation(copy));
            } else {
                values.push(bestPosition(copy, depth - 1)[1]);
            }
        }
    }

    if (player === 0) {
        const maxValue = Math.max(...values);
        const bestMove = possibleMoves[values.indexOf(maxValue)];
        return [bestMove, maxValue];
    } else if (player === 1) {
        const minValue = Math.min(...values);
        const bestMove = possibleMoves[values.indexOf(minValue)];
        return [bestMove, minValue];
    }
}

function valuation(board) {
    const values = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
    let valuation = 0;
    for (let k of [0, 1]) {
        for (let piece of board.pieces[k]) {
            valuation += (1 - 2 * k) * values[piece.label];
        }
    }
    return valuation;
}

export default function bestMove(board, depth) {
    return bestPosition(board, depth)[0];
}
