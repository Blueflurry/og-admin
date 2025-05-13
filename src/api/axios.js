import axios from "axios";

const baseURL = "https://sharing-sponge-forcibly.ngrok-free.app/api";
// const baseURL = "https://jaro-connect-backend.onrender.com/api";

const instance = axios.create({ baseURL, withCredentials: true });

// Add response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear user data from localStorage
            localStorage.removeItem("user");

            // Redirect to login page
            window.location = "/auth/login";
        }
        return Promise.reject(error);
    }
);

export default instance;
