import React, { useEffect, useRef, useState } from 'react';
import {Link} from 'react-router-dom'
import './topbar.css'

export default function Topbar(){

    return(
        <nav className='topbar'>
            <ul>
                <li><Link to='/' className='topbar_item'>Home</Link></li>
                <li><Link to='/About' className='topbar_item'>About</Link></li>
                <li><Link to='/Contact' className='topbar_item'>Contact</Link></li>
            </ul>
        </nav>
    )
}