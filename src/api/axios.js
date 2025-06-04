import axios from "axios";

// const baseURL =
//     "https://34ff-2401-4900-1f38-3ccc-f47f-2bd9-7e83-2fc6.ngrok-free.app/api";
// const baseURL = "http://localhost:4000/api";
const baseURL = "https://oblik.ddns.net/api";

// const instance = axios.create({ baseURL });
const instance = axios.create({ baseURL, withCredentials: true });

// Add request interceptor
instance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem("token");

        // If token exists, set it in the Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear user data from localStorage
            localStorage.removeItem("user");
            localStorage.removeItem("token");

            // Redirect to login page
            window.location = "/auth/login";
        }
        return Promise.reject(error);
    }
);

export default instance;
