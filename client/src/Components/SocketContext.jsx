import io from "socket.io-client";
import { useEffect, createContext } from "react";

export const SocketContext = createContext();

const serverUrl = process.env.NODE_ENV === "production" ? import.meta.env.VITE_SERVER_URL : "http://localhost:1234";
const socket = io.connect(serverUrl, {
    withCredentials: true,
    autoConnect: false,
});

export default function SocketProvider({ children }) {
    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.disconnect();
        };
    }, []);
    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
