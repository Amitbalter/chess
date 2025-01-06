import { piece } from "./piece.js"

class knight extends piece{
    constructor(color){
        super(color)
        this.label = 'N'
        }

    updateMoves(board){
        const [i,j] = this.position
        this.moves = []
        for (let k1 of [-1,1]){
            for (let k2 of [-1,1]){
                for (let k3 of [1,2]){
                    const [row,col] = [i + k1*k3, j + k2*(3-k3)]
                    if (row >= 0 && row <= 7 && col >= 0 && col <= 7){
                        const piece = board.array[row][col].piece
                        if (piece.color !== this.color){
                            this.legalmove(row,col,board)
                        }               
                    }
                }
            }
        }
    }
}

export {knight}