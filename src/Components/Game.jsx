import React, { useEffect, useRef, useState } from 'react';
import Topbar from './Topbar';
import {Link} from 'react-router-dom'
import Square from './Square';
import Timer from './Timer';
import { board } from '../dynamics/board';
import { king } from '../dynamics/king';
import { pawn } from '../dynamics/pawn';
import { rook } from '../dynamics/rook';
import { bishop } from '../dynamics/bishop';
import { knight } from '../dynamics/knight';
import {bestMove} from '../dynamics/opponent'
import './Game.css'

export default function Game({computer}) {

    const buttons = useRef(Array.from({length:8},( _ => [])))
    const addButtonRef = (ref, index) => {
        buttons.current[index[0]][index[1]] = ref
    }
    const redoRef = useRef(null)

    const colors = ['white','black']
    const depth = 2
    const [flip, setFlip] = useState(computer ?? 1)
    const [i1, seti1] = useState(null)
    const [j1, setj1] = useState(null)
    const [i2, seti2] = useState(null)
    const [j2, setj2] = useState(null)
    const [result, setResult] = useState(null)
    const [undo, setUndo] = useState(0)
    const [gameBoard, setGameBoard] = useState(new board())
    const [prev, setPrev] = useState(null)
    const [next,setNext] = useState(0)
    const [restart, setRestart] = useState(0)
    
    function handleFlip(){
        setFlip(1-flip)
    } 

    function resetColors(){
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                buttons.current[i][j].current.style.backgroundColor = ''
            }
        }
    }

    function disableButtons(bool){
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                buttons.current[i][j].current.disabled = bool
            }
        }
    }

    function handleTakeback(){
        let dummyboard
        if (computer === null && gameBoard.turn >= 1){
            dummyboard = gameBoard.replicate(gameBoard.turn - 1)
            delete gameBoard.history[gameBoard.turn]
            dummyboard.history = gameBoard.history
            dummyboard.updateBoardMoves(dummyboard.turn % 2)
            setGameBoard(dummyboard)
            setPrev(dummyboard.lastMove)
        }
        else if(gameBoard.turn >= 2 ){
            dummyboard = gameBoard.replicate(gameBoard.turn - 2)
            delete gameBoard.history[gameBoard.turn]
            delete gameBoard.history[gameBoard.turn-1]
            dummyboard.history = gameBoard.history
            dummyboard.updateBoardMoves(dummyboard.turn % 2)
            setGameBoard(dummyboard)
            setPrev(dummyboard.lastMove)
        }
        seti1(null)
        seti2(null)
        setj1(null)
        setj2(null)
        setResult(null)
        
    } 

    function handleUndo(){
        if (undo > 0){
            const dummyboard = gameBoard.replicate(undo - 1)
            dummyboard.history = gameBoard.history
            setGameBoard(dummyboard)
            disableButtons(true)
            setPrev(dummyboard.lastMove)
            setUndo(undo - 1)
        }
    }

    function handleRedo(){
        if (undo + 2 <= Object.keys(gameBoard.history).length){
            const dummyboard = gameBoard.replicate(undo + 1)
            dummyboard.history = gameBoard.history
            if (undo + 2 === Object.keys(gameBoard.history).length){
                dummyboard.updateBoardMoves(dummyboard.turn % 2)
                disableButtons(false)
            }
            setGameBoard(dummyboard)
            setPrev(dummyboard.lastMove)
            setUndo(undo + 1)
        }
    }

    function handleRestart(){
        setRestart(restart+1)
        setResult(null)
        setPrev(null)
        disableButtons(false)
    }

    function generateMove(){
        const move = bestMove(gameBoard, depth)
        if (move){
            seti1(move[0])
            setj1(move[1])
            seti2(move[2])
            setj2(move[3])
        }
    }

    function setInput(_,index){
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
            if (gameBoard.array[i1][j1].piece.moves.includes([row,col].join(''))){
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
    
    useEffect(()=>{
        resetColors()
        const dummyBoard = new board()
        // dummyBoard.setPiece(0, 3, new king('white')) 
        // dummyBoard.setPiece(3, 0, new bishop('white')) 
        // dummyBoard.setPiece(7, 3, new king('black')) 
        // dummyBoard.setPiece(6, 6, new knight('black'))
        // dummyBoard.setPiece(4, 5, new knight('white'))
        // dummyBoard.setPiece(3, 4, new pawn('black'))
        // dummyBoard.setPiece(0, 5, new rook('white'))
        // dummyBoard.history[0] = JSON.parse(JSON.stringify(dummyBoard))
        // dummyBoard.updateBoardMoves(0)
        dummyBoard.setupBoard()
        setGameBoard(dummyBoard) //updating with dummy board to trigger re-render
        setNext(1-next)
        setFlip(computer ?? 1)
    },[restart])

    //coloring previous move in blue
    useEffect(()=>{
        resetColors() 
        if (prev !== null){
            buttons.current[[prev[0],7-prev[0]][flip]][[prev[1],7-prev[1]][flip]].current.style.backgroundColor  = 'rgb(72, 111, 197)'
            buttons.current[[prev[2],7-prev[2]][flip]][[prev[3],7-prev[3]][flip]].current.style.backgroundColor = 'rgba(68, 114, 212, 0.78)'
            setNext(1-next)
        }
    },[prev,i1,j1,flip])

    useEffect(()=>{
        if (gameBoard.turn % 2 === computer){
            generateMove()
        }
    },[next])

    //coloring current piece and moves in green if human move
    useEffect(() => {
        if (i1!==null && j1!==null && gameBoard.turn % 2 !== computer){ 
            let piece1 = gameBoard.array[i1][j1].piece
            buttons.current[[i1,7-i1][flip]][[j1,7-j1][flip]].current.style.backgroundColor  = 'rgb(5, 136, 0)' 
            for (let move of piece1.moves){
                const [k,l] = [Number(move[0]),Number(move[1])]
                buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'rgba(8, 141, 3, 0.75)'
            }
        }
    },[i1,j1,flip])

    //coloring king in orange if in check
    useEffect(() => {
        if (gameBoard.check !== null){
            console.log('king is in check')
            const [k,l] = gameBoard.pieces[gameBoard.turn % 2].find(piece => piece.label === 'K').position
            if (k !== i1 || l !== j1){
                buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'rgb(218, 137, 33)'
            }
        }    
    },[gameBoard.check,i1,j1,flip])

    //making the move and updating the board according to the outcome
    useEffect(() => {
        if (i2 !== null && j2 !== null ){
            setResult(gameBoard.makeMove(i1, j1, i2, j2))
            setPrev([i1,j1,i2,j2])
            seti1(null)
            seti2(null)
            setj1(null)
            setj2(null)
            // if (computer === null) setFlip(1-flip)
        }
    },[i2,j2])

    useEffect(()=>{
        let king1 = gameBoard.pieces[gameBoard.turn % 2].find(piece => piece.label === 'K')
        let king2 = gameBoard.pieces[(gameBoard.turn+1) % 2].find(piece => piece.label === 'K')
        if (king1 && king2){
            let [k,l] = king1.position
            let [m,n] = king2.position        
            switch (result){
                case 'checkmate':
                    console.log('checkmate')
                    buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'purple'                 
                    disableButtons(true)
                    break
                case 'stalemate':
                    console.log('stalemate')
                    buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'pink'
                    buttons.current[[m,7-m][flip]][[n,7-n][flip]].current.style.backgroundColor = 'pink'                     
                    disableButtons(true)     
                    break
                case 'threefold':
                    console.log('threefold repetition')
                    buttons.current[[k,7-k][flip]][[l,7-l][flip]].current.style.backgroundColor = 'yellow'  
                    buttons.current[[m,7-m][flip]][[n,7-n][flip]].current.style.backgroundColor = 'yellow'                   
                    disableButtons(true)  
                    break
            }
        }
        setUndo(gameBoard.turn)
    },[gameBoard.turn,flip])

    useEffect(() => {
        if (undo + 2 <= Object.keys(gameBoard.history).length){
            redoRef.current.style.backgroundColor =  'rgba(8, 141, 3, 0.75)'
        }
        else{
            redoRef.current.style.backgroundColor = ''
        }
    },[undo])



    return (
        <>
        <Topbar/>
        <div className='game'>
            <div className='left'>
                <Timer turn = {gameBoard.turn} player = {1} time = {100}/>
                <Timer turn = {gameBoard.turn} player = {0} time = {100}/>
            </div>
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
            <div className='right'>
                <button className='option' onClick={handleFlip}>Flip Board</button>
                <button className='option' onClick={handleTakeback}>Takeback</button>
                <button className='option' onClick={handleUndo}>Undo</button>
                <button className='option' onClick={handleRedo} ref={redoRef}>Redo</button>
                <button className='option' onClick={handleRestart}>Restart</button>
            </div>
        </div>
        </>
        
    );
}