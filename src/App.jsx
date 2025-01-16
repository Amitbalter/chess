import { useState, useRef} from 'react'
import {HashRouter as Router, BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import Game from './Components/Game.jsx'
import Home from './Components/Home.jsx'
import About from './Components/About.jsx'
import Contact from './Components/Contact.jsx'
import './App.css' 

function App() {
    
  return (
    <Router>
      <Routes>
        <Route path='/' element ={<Home/>}/>
        <Route path= '/About' element = {<About/>}/>
        <Route path= '/Contact' element = {<Contact/>}/>
        <Route path='/gameWhite' element ={<Game computer = {1}/>}/>
        <Route path='/gameBlack' element ={<Game computer = {0}/>}/>
        <Route path='/gameFriend' element ={<Game computer = {null}/>}/>
      </Routes>
    </Router>
  )
}

export default App;
