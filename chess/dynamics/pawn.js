import { piece } from './piece.js'

class pawn extends piece {
    constructor(color){
        super(color)
        this.label = 'P'
    }

    updateMoves(board){
        const [i,j] = this.position
        this.moves = []
        const k = -2*['white', 'black'].indexOf(this.color)+1 //+1 for white and -1 for black
        if (k*i < 7*(k+1)/2){  //only when pawn is before final row
            //if pawn on first file add two moves
            if (i === [1,6][(1-k)/2]){
                for (let s of [1,2]){
                    const [row,col] = [i+k*s, j]
                    let piece = board.array[row][col].piece
                    if (piece.label !== ' '){
                        break
                    }
                    else{
                        this.legalmove(row,col,board)
                    }
                }
            }
            //if pawn on other file add one move
            else{
                const [row,col] = [i+k, j]
                let piece = board.array[row][col].piece
                if (piece.label === ' '){
                    this.legalmove(row,col,board)
                }
            }
            //capturing
            for (let s of [-1,1]){
                if (j+s >= 0 && j+s <= 7){
                    const [row,col] = [i+k, j+s]
                    let piece = board.array[row][col].piece
                    if (piece.color !== this.color && piece.label !== ' '){
                        this.legalmove(row,col,board)
                    }
                    else if(j+s === board.enPassant[(1+k)/2] && i+k === 3*(k+1)/2 + 2){
                        this.legalmove(row,col,board)
                    }
                }
            }  
        }
    }
}

export {pawn}