import { board } from '../dynamics/board.js'
import { pawn } from '../dynamics/pawn.js'
import { rook } from '../dynamics/rook.js'
import { knight } from '../dynamics/knight.js'
import { bishop } from '../dynamics/bishop.js'
import { queen } from '../dynamics/queen.js'
import { king } from '../dynamics/king.js'
import { empty } from '../dynamics/empty.js'
import { useState, useRef} from 'react'
import './App.css'
import Board from './Board.jsx'
import Options from './Options.jsx'
import Square from './Square.jsx'

function App() {
    
  return (
    <>  
      <Board/>
    </>
  )
}

export default App



