import axios from "axios";

// const baseURL = "https://sharing-sponge-forcibly.ngrok-free.app/api";
// const baseURL = "http://localhost:4000/api";
const baseURL = "https://oblik.ddns.net/api";

// const instance = axios.create({ baseURL });
const instance = axios.create({ baseURL, withCredentials: true });

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
