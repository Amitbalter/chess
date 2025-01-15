import React, { useEffect, useRef, useState } from 'react';
import {Link} from 'react-router-dom'
import Topbar from './Topbar';
import './Home.css'

export default function Home(){

    return(<div>
        <Topbar/>
        <h1>Welcome to my chess app!</h1>
        <h2>Choose which option to play:</h2>
        <nav className='navbar'>
        <ul>
            <li><Link to='/gameWhite' className = 'homepageLink'>Play as White</Link></li>
            <li><Link to='/gameBlack' className = 'homepageLink'> Play as Black</Link></li>
            <li><Link to='/gameFriend' className = 'homepageLink'>Play with a friend</Link></li>
        </ul>
        </nav>
    </div>)
    
}