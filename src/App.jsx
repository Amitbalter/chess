import { useState, useRef} from 'react'
import {HashRouter as Router, BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import Game from './Game.jsx'

function Home(){

  return(<div>
    <h1>Welcome to my chess app!</h1>
    <h2>Choose which option to play:</h2>
    <nav className='navbar'>
      <ul>
        <li><Link to='/gameWhite' className = 'homepageLink'>Play as White</Link></li>
        <li><Link to='/gameBlack' className = 'homepageLink'> Play as Black</Link></li>
        <li><Link to='/gameFriend' className = 'homepageLink'>Play with a friend</Link></li>
      </ul>
    </nav>
    <a href="https://github.com/Amitbalter/chess" target="_blank">The source code can be found here</a>
    <p>testing</p>
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
        <Route path='/source_code' component={() => {
              window.location.href = 'https://github.com/Amitbalter/chess';
              return null;
              }}
        />
      </Routes>
    </Router>
  )
}

export default App;
