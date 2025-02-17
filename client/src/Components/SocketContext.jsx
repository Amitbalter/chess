import io from "socket.io-client";
import { createContext } from "react";

export const SocketContext = createContext();

const serverUrl = process.env.NODE_ENV === "production" ? import.meta.env.VITE_SERVER_URL : "http://localhost:1234";
const socket = io.connect(serverUrl);

export default function SocketProvider({ children }) {
    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
