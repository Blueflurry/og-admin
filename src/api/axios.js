import axios from "axios";

// const baseURL = "https://sharing-sponge-forcibly.ngrok-free.app/api";
// const baseURL = "http://localhost:4000/api";
const baseURL = "https://oblik.ddns.net/api";

const instance = axios.create({ baseURL });
// const instance = axios.create({ baseURL, withCredentials: true });

export default instance;
