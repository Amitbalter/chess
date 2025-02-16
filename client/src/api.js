import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:1234",
    withCredentials: true,
});

// Log every request
api.interceptors.request.use((request) => {
    console.log("Sending Request:", request.method, request.url);
    return request;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

export default api;
