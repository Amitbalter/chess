import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import classes from "./topbar.module.css";

export default function Topbar() {
    return (
        <nav className={classes.topbar}>
            <Link to="/" className={classes.topbar_link}>
                Home
            </Link>
            <Link to="/About" className={classes.topbar_link}>
                About
            </Link>
            <Link to="/Contact" className={classes.topbar_link}>
                Contact
            </Link>
        </nav>
    );
}
