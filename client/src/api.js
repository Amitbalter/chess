import axios from "axios";

export const serverUrl = import.meta.env.VITE_SERVER_URL ||
    (import.meta.env.DEV ? "http://localhost:1234" : window.location.origin);

const api = axios.create({
    baseURL: serverUrl,
    withCredentials: true,
});

export default api;
