import io from "socket.io-client";
import { useEffect, createContext } from "react";

export const SocketContext = createContext();

const serverUrl = import.meta.env.DEV ? "http://localhost:1234" : window.location.origin
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
