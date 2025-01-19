import Topbar from "./Topbar"
import React, { useEffect, useRef, useState } from 'react';

export default function Contact(){

    return(
        <div>
            <Topbar/>
            <p>
                My name is Amit Balter 
                <br/>
                Phone: 07914 385 755
                <br/>
                Email: amitbaltern@gmail.com
            </p>
        </div>
    )
}