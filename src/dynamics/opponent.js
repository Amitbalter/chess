function bestPosition(board, depth) {
    const possibleMoves = [];
    let values = [];
    const player = board.turn % 2;
    for (let piece1 of board.pieces[player]) {
        for (let move1 of piece1.moves) {
            const copy = board.replicate();
            const [i1, j1] = piece1.position;
            const [i2, j2] = [Number(move1[0]), Number(move1[1])];
            copy.makeMove(i1, j1, i2, j2);
            possibleMoves.push([i1, j1, i2, j2]);
            if (copy.state === "checkmate") {
                values.push([1000, -1000][player]);
            } else {
                if (depth === 0) {
                    values.push(copy.valuation());
                } else {
                    values.push(bestPosition(copy, depth - 1)[1]);
                }
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

function bestMove(board, depth) {
    return bestPosition(board, depth)[0];
}

export { bestMove };
