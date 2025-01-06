import { pawn } from './pawn.js'
import { rook } from './rook.js'
import { knight } from './knight.js'
import { bishop } from './bishop.js'
import { queen } from './queen.js'
import { king } from './king.js'
import { empty } from './empty.js'
import { piece } from './piece.js'

class square{
    constructor(color, position, piece){
        this.color = color
        this.position = position
        this.piece = piece
    }
}

class board{
    constructor(){
        this.array = []
        for (let i = 0; i < 8; i++){
            let row = []
            for (let j = 0; j < 8; j++){
                row.push(new square(['white','black'][(i+j)%2], [i,j], new empty())) 
            }
            this.array.push(row)
        }
        this.enPassant = [null,null]
        this.pieces = [[],[]]
        this.moves = [[],[]]
        this.turn = 0
        this.check = null
        this.history = {}
    }
    
    setupBoard(){
        const whitePieces = [new rook('white'), new knight('white'),new bishop('white'), new king('white'), 
                            new queen('white'), new bishop('white'), new knight('white'), new rook('white')]
        const blackPieces = [new rook('black'), new knight('black'),new bishop('black'), new king('black'), 
                            new queen('black'), new bishop('black'), new knight('black'), new rook('black')]
        for (let j = 0; j < 8; j++){
            this.setPiece(1, j, new pawn('white'))  
            this.setPiece(6, j, new pawn('black'))  
            this.setPiece(0, j, whitePieces[j])  
            this.setPiece(7, j, blackPieces[j])
        }

        this.history[0] = JSON.parse(JSON.stringify(this))
        this.updateBoardMoves(0)
    }

    setPiece(i,j,piece){
        const square = this.array[i][j]
        if (square.piece.label !== ' '){
            const color = ['white', 'black'].indexOf(square.piece.color)
            const index = this.pieces[color].indexOf(square.piece)
            this.pieces[color].splice(index,1)
        }
        square.piece = piece //place piece on square
        piece.position = [i,j] //update position of piece
        if (piece.label !== ' '){ 
            this.pieces[['white', 'black'].indexOf(piece.color)].push(piece) //add piece to board pieces
        }
    }
        
    doMove(square1, square2){
        const piece1 = square1.piece
        const piece2 = square2.piece

        //removing captured piece from the board
        if (piece2.label !== ' '){
            const color = ['white', 'black'].indexOf(piece2.color)
            const index = this.pieces[color].indexOf(piece2)
            this.pieces[color].splice(index, 1) //remove piece on square2 from board pieces
        }
        
        square2.piece = piece1 //move piece from square1 to square2
        piece1.position = square2.position //update position of piece
        square1.piece = new empty() //square1 is now empty
    }
    
    //function that updates all the possible moves on the board
    updateBoardMoves(k){
        this.moves[k] = []
        for (let piece of this.pieces[k]){
            piece.updateMoves(this)
            this.moves[k] = this.moves[k].concat(piece.moves)
        }
        this.moves[k] = [... new Set(this.moves[k])]
    }
    
    kingInCheck(color){     
        let kingPos = this.pieces[color % 2].find(piece => piece.label === 'K').position.join('')
        if (this.moves[(color + 1)%2].includes(kingPos)){
            return true
        }
        return false
    }

    replicate(turn){
        const copy  = new board()
        const arrangement = this.history[turn]
        copy.moves = [[],[]]
        copy.turn = arrangement.turn
        copy.enPassant = [...arrangement.enPassant]
        copy.check = arrangement.check
        copy.pieces = [[],[]]
        for (let k of [0,1]){
            for (let piece of arrangement.pieces[k]){
                const pieces = [new pawn(piece.color), new knight(piece.color), new bishop(piece.color),
                                new rook(piece.color), new queen(piece.color), new king(piece.color)]
                const labels = ['P','N','B','R','Q','K']
                const copyPiece = pieces[labels.indexOf(piece.label)]
                copyPiece.castle = piece.castle
                copyPiece.position = [...piece.position]
                copy.pieces[k].push(copyPiece)
                copy.array[copyPiece.position[0]][copyPiece.position[1]].piece = copyPiece  
            }
        }
        return copy
    } 

    choosePiece(){
        const piece2 = window.prompt('choose a piece from Q,R,B,N:')
        const index = ['Q','R','B','N'].indexOf(piece2.toUpperCase())
        if (index === -1){
            return this.choosePiece()
        }
        return index
    }


    makeMove(i1, j1, i2, j2){
        const piece1 = this.array[i1][j1].piece
        const result = piece1.move(i1, j1, i2, j2, this)
        if (result === 'promotion'){
            console.log('promotion')
            const color = piece1.color
            const pieces = [new queen(color), new rook(color), new bishop(color), new knight(color)]
            this.setPiece(i1, j1, new empty())
            this.setPiece(i2, j2, pieces[this.choosePiece()])
        }
        if (result){
   
            this.turn ++
            this.enPassant[this.turn % 2] = null
            this.check = null
            
            const arrangement = JSON.parse(JSON.stringify(this))
            arrangement.history = {}
            this.history[this.turn] = arrangement
            
            this.updateBoardMoves((this.turn+1)%2)
            if (this.kingInCheck(this.turn % 2)){
                this.moves = [[],[]]
         
                this.updateBoardMoves(this.turn % 2)
                if (this.moves[this.turn % 2].length !== 0){
                    this.check = this.turn % 2
                    arrangement.check = this.check
                }
                else{
                    return 'checkmate'
                }
            }
            
            else{
                this.moves = [[],[]]
                this.updateBoardMoves(this.turn % 2)
                if (this.moves[this.turn % 2].length === 0){
                    return 'stalemate'           
                }
            }
            //threefold repetition
            let repetition = 0
            for (let arr in this.history){
                if (arr.turn === arrangement.turn){
                    if (equalArrangments(arr, arrangement)){
                        repetition++
                    }
                }
            }                
            if (repetition === 2){
                return'threefold'
            }  
        }
    }

    bestMove(){
        let currentValue = this.valuation()
        let bestMove = null
        for (let piece1 of this.pieces[this.turn%2]){
            for (let move1 of piece1.moves){
                const copy = this.replicate(this.turn)
                const [i1,j1] = piece1.position
                const [i2,j2] = [Number(move1[0]),Number(move1[1])]
                const result1 = copy.makeMove(i1,j1,i2,j2)
                if (result1 === 'checkmate'){
                    return [i1,j1,i2,j2]
                }
                else{
                    copy.updateBoardMoves(copy.turn % 2) //update moves of opposite color
                    for (let piece2 of copy.pieces[copy.turn%2]){
                        for (let move2 of piece2.moves){
                            const copy2 = copy.replicate(copy.turn)
                            const [k1,l1] = piece2.position
                            const [k2,l2] = [Number(move2[0]),Number(move2[1])]
                            const result2 = copy2.makeMove(k1,l1,k2,l2)
                            if (result2 === 'checkmate'){
                                break
                            }
                            else{
                                let value = copy2.valuation()
                                if (value >= currentValue){
                                    currentValue = value
                                    bestMove = [i1,j1,i2,j2]
                                }
                            }
                        }
                    }
                }
            }
        }
        return bestMove
    }

    valuation(){
        const values = {'P':1, 'N':3, 'B':3, 'R': 5, 'Q':9, 'K':0}
        let valuation = 0
        for (let k of [0,1]){
            for (let piece of this.pieces[k]){
                valuation += (1-2*k)*values[piece.label]
            }
        }
        return valuation*(1-2*(this.turn%2))
    }
}

function equalArrangments(arr1, arr2){
    if(JSON.stringify(arr1.enPassant) === JSON.stringify(arr2.enPassant)){
        if (stringifyArray(arr1.array) === stringifyArray(arr2.array)){
            return true
        }
    }
    return false
}

function stringifyArray(array){
    let string = ''
    for (let i = 0;i < 8;i++){
        for (let j = 0;j < 8;j++){
            string += array[i][j].piece.label
            string += array[i][j].piece.color
            string += array[i][j].piece.castle
        }   
    }
    return string
}
export {board}