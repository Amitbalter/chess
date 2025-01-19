import React, { useEffect, useRef, useState } from 'react';
import {Link} from 'react-router-dom'
import './topbar.css'

export default function Topbar(){

    return(
        <nav className='topbar'>
            <Link to='/' className='topbar_link'>Home</Link>
            <Link to='/About' className='topbar_link'>About</Link>
            <Link to='/Contact' className='topbar_link'>Contact</Link>          
        </nav>
    )
}