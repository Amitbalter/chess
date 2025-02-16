import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./Components/Game.jsx";
import Home from "./Components/Home.jsx";
import About from "./Components/About.jsx";
import Contact from "./Components/Contact.jsx";
import SocketProvider from "./Components/SocketContext.jsx";

export default function App() {
    return (
        <SocketProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="About" element={<About />} />
                    <Route path="Contact" element={<Contact />} />
                    <Route path="game/:id" element={<Game />} />
                </Routes>
            </Router>
        </SocketProvider>
    );
}
