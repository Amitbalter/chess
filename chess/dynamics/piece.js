import { empty } from "./empty.js"

class piece{
    constructor(color){
        this.color = color
        this.castle = 'N'
        this.moves = []
        this.position = []
    }

    move(i1, j1, i2, j2, board){
        const square1 = board.array[i1][j1]
        const square2 = board.array[i2][j2]
        const piece = square2.piece
        const k = -2*['white', 'black'].indexOf(this.color)+1
        if (this.label === 'P' && i1 + 2*k === i2){
            board.enPassant[(1-k)/2] = j1
            board.doMove(square1, square2)
            return true
        }
        else if(this.label === 'P' && piece.label === ' ' && j1 !== j2){
            board.setPiece((7+k)/2, j2, new empty())
            board.doMove(square1, square2)
            return true
        }
        else if (this.label === 'P' && i2 === 7*(k+1)/2){
            return 'promotion'
        }
        else if (this.color !== piece.color){
            this.castle = 'N'    
            board.doMove(square1, square2)
            return true
        }
        else {
            const index = ['K','R'].indexOf(piece.label)
            const row = 7 * ['white','black'].indexOf(this.color)
            const side = 2*[j1,j2][index]/7 - 1
            board.doMove([square1,square2][index], board.array[row][3 + side])
            board.doMove([square1,square2][(index+1)%2], board.array[row][3 + 2*side])
            this.castle = 'N'
            piece.castle = 'N'
            return true       
        }
    
        return false
    }
    
    exposesKing(row,col,board){
        const [i,j] = this.position
        const n = ['white','black'].indexOf(this.color)
        const copy = board.copy()
        const [square1,square2] = [copy.array[i][j],copy.array[row][col]]
        const [piece1,piece2] = [square1.piece, square2.piece]
        if(piece1.label === 'P' && piece2.label === ' ' && j !== col){ //enpassant
            copy.setPiece(4-n, col, new empty())
        }
        copy.doMove(square1, square2)
        copy.updateBoardMoves(1-n) //update moves of opposite color
        //check if king of same color in check
        if (!copy.kingInCheck(n)){
            return false
        }
        else{
            return true
        }
    }

    legalmove(row,col,board){
        if (this.color === ['white','black'][board.turn % 2]){
            if (!this.exposesKing(row,col,board)){
                this.moves.push([row,col].join(''))
            }       
        }
        else this.moves.push([row,col].join(''))
    }
}

export {piece}