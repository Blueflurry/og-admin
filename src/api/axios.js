import axios from "axios";

const baseURL = "https://sharing-sponge-forcibly.ngrok-free.app/api";
// const baseURL = "https://jaro-connect-backend.onrender.com/api";

const instance = axios.create({ baseURL, withCredentials: true });

export default instance;
