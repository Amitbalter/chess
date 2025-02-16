import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL || "http://localhost:1234",
    withCredentials: true,
});

export default api;
