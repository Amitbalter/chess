import React, { useEffect, useRef, useState } from 'react';
import Square from './Square';
import { board } from '../dynamics/board';
import { king } from '../dynamics/king';
import { pawn } from '../dynamics/pawn';
import { use } from 'react';
import whitePawn from "./assets/whitePawn.png"


function Board() {

    const buttons = useRef(Array.from({length:8},(idx => [])));
    const addButtonRef = (ref, index) => {
        buttons.current[index[0]][index[1]] = ref
    };

    const colors = ['white','black']
    const [flip, setFlip] = useState(1)
    
    
    function handleFlip(){
        setFlip(f => 1-f)
        updateBoard(gameBoard)
    } 

    function resetColors(){
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                buttons.current[i][j].current.style.backgroundColor = ''
            }
        }
    }

    function disableButtons(){
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                buttons.current[i][j].current.disabled = true
            }
        }
    }
    
    const [gameBoard, setGameBoard] = useState(new board()) 
    useEffect(()=>{
        const dummyBoard = new board()
        // dummyBoard.setPiece(5, 4, new king('black')) 
        // dummyBoard.setPiece(0, 3, new king('white')) 
        // dummyBoard.setPiece(1, 6, new pawn('black'))
        // dummyBoard.setPiece(1, 3, new pawn('white')) 
        // dummyBoard.setPiece(0, 4, new rook('white'))
        // dummyBoard.setPiece(7, 0, new rook('black'))
        // dummyBoard.history.push(JSON.parse(JSON.stringify(dummyBoard)))
        // dummyBoard.updateBoardMoves(0)
        dummyBoard.setupBoard()
        setGameBoard(dummyBoard)
    },[])

    const [i1, seti1] = useState(null)
    const [j1, setj1] = useState(null)
    const [i2, seti2] = useState(null)
    const [j2, setj2] = useState(null)
    const [piece1, setPiece1] = useState(null)
    const [check, setCheck] = useState(null)
    const [result, setResult] = useState(null)

    const setInput = (_,index) => {
        const [i,j] = [index[0],index[1]]
        const row = [i,7-i][flip]
        const col = [j,7-j][flip]
        //setting input1 and input2
        if (i1 === null){ 
            // check correct color according to turn
            if(gameBoard.array[row][col].piece.color === colors[gameBoard.turn % 2]){
                seti1(row)
                setj1(col)
            }
            else {
                console.log(`It is ${colors[gameBoard.turn % 2]}'s turn to play`)
            }
        }
        //if second square is same piece of same colour then change input1 to new piece
        else if (i1 !== null){
            if (piece1.moves.includes([row,col].join(''))){
                seti2(row)
                setj2(col)
            }
            else if (gameBoard.array[row][col].piece.color === colors[gameBoard.turn % 2]){
                if (i1!==row || j1!==col){
                    seti1(row)
                    setj1(col)
                }
                else{        
                    seti1(null)
                    seti1(null)
                }
            }
            else{
                seti1(null)
                seti1(null)
            }
        }
    }

    //making the move and updating the board according to the outcome
    useEffect(() => {
        if (i2 !== null && j2 !== null ){
            setResult(gameBoard.makeMove(i1, j1, i2, j2))
            seti1(null)
            seti2(null)
            setj1(null)
            setj2(null)
            setCheck(null)
            }
    },[i2,j2])

    //highlighting current piece in red
    useEffect(() => {
        resetColors()
        if (i1!==null && j1!==null){  
            setPiece1(gameBoard.array[i1][j1].piece)
            buttons.current[[i1,7-i1][flip]][[j1,7-j1][flip]].current.style.backgroundColor  = 'red'
        }
        else{
            setPiece1(null)
        }
    },[i1,j1])

    //highlighting possible squares in green
    useEffect(() => {
        if (piece1){
            for (let move of piece1.moves){
                const [k,l] = [Number(move[0]),Number(move[1])]
                buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'green'
            }
        }
    },[piece1])
    
    useEffect(()=>{
        if (gameBoard.turn >= 1){
            let [k,l] = gameBoard.pieces[gameBoard.turn % 2].find(piece => piece.label === 'K').position
            let [m,n] = gameBoard.pieces[(gameBoard.turn+1) % 2].find(piece => piece.label === 'K').position        
            switch (result){
                case 'check':
                    console.log('king is in check')
                    setCheck([k,l])
                    break
                case 'checkmate':
                    console.log('checkmate')
                    buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'purple'                 
                    disableButtons()
                    break
                case 'stalemate':
                    console.log('stalemate')
                    buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'pink'
                    buttons.current[[m,7-m][flip]][[n,7-n][flip]].current.style.backgroundColor = 'pink'                     
                    disableButtons()     
                    break
                case 'threefold':
                    console.log('threefold repetition')
                    buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'yellow'  
                    buttons.current[[m,7-m][flip]][[n,7-n][flip]].current.style.backgroundColor = 'yellow'                   
                    disableButtons()  
                    break
            }
        }
    },[gameBoard.turn])
    
    //highlighting king in orange if in check
    useEffect(() => {
        if (check !== null){
            const [k,l] = [check[0],check[1]]
            if (k !== i1 || l !== j1){
                console.log('hello')
                buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'orange'
            }
        }    
    },[check,i1,j1])
    
    return (<>
        <div className='board'>
            {Array.from({length:8}).map((_, row) => (
                Array.from({length:8}).map((_, col) =>(
                    <Square
                    key = {[row,col]}
                    index = {[row,col]}
                    addRef = {addButtonRef}
                    onFocus = {setInput}
                    piece = {gameBoard.array[[row,7-row][flip]][[col,7-col][flip]].piece.label}
                    color = {gameBoard.array[[row,7-row][flip]][[col,7-col][flip]].piece.color}
                    />
                ))))}
        </div>
        </>
    );
}

export default Board;
