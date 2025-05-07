import axios from "axios";

const baseURL = "https://api.karma.blueflurry.io";

const instance = axios.create({ baseURL });

export default instance;
