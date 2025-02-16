import io from "socket.io-client";
import { createContext } from "react";

export const SocketContext = createContext();

const socket = io.connect("http://localhost:1234");

export default function SocketProvider({ children }) {
    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
