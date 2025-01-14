import { piece } from './piece.js'
import { empty } from './empty.js'

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

    move(i1, j1, i2, j2, board){
        const square1 = board.array[i1][j1]
        const square2 = board.array[i2][j2]
        const piece = square2.piece
        const player = -2*['white', 'black'].indexOf(this.color)+1
        if (this.label === 'P' && i1 + 2*player === i2){
            board.enPassant[(1-player)/2] = j1
            board.doMove(square1, square2)
            return true
        }
        else if(this.label === 'P' && piece.label === ' ' && j1 !== j2){
            board.setPiece((7+player)/2, j2, new empty())
            board.doMove(square1, square2)
            return true
        }
        else if (this.label === 'P' && i2 === 7*(player+1)/2){
            return 'promotion'
        }
        else if (this.color !== piece.color){
            this.castle = 'N'    
            board.doMove(square1, square2)
            return true
        }
    }
}

export {pawn}