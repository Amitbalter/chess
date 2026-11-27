import io from "socket.io-client";
import { useEffect, createContext } from "react";
import { serverUrl } from "../api";

export const SocketContext = createContext();

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
