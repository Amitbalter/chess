import { useState, useRef} from 'react'
import {HashRouter as Router, BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import Game from './Game.jsx'

function Home(){

  return(<div>
    <h1>Welcome to my chess app!</h1>
    <h2>Choose which option to play:</h2>
    <Link to='/gameWhite'>Play as White</Link>
    <Link to='/gameBlack'>Play as Black</Link>
    <Link to='/gameFriend'>Play with a friend</Link>
  </div>)
}

function App() {
    
  return (
    <Router>
      <Routes>
        <Route path='/' element ={<Home/>}/>
        <Route path='/gameWhite' element ={<Game player = {0}/>}/>
        <Route path='/gameBlack' element ={<Game player = {1}/>}/>
        <Route path='/gameFriend' element ={<Game player = {null}/>}/>
      </Routes>
    </Router>
  )
}

export default App;
