import axios from "axios";

// 1. Define your API class
export class API {
    constructor(setLoading, setError) {
        this.setLoading = setLoading;
        this.setError = setError;
        this.pendingRequests = 0;

        // Create axios instance with defaults
        this.client = axios.create({
            baseURL: "https://api.example.com",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    // Wrap API calls to track loading state
    async request(requestFn) {
        this.pendingRequests++;
        this.setLoading(true);

        try {
            const result = await requestFn();
            return result;
        } catch (err) {
            this.setError(err);
            throw err;
        } finally {
            this.pendingRequests--;
            if (this.pendingRequests === 0) {
                this.setLoading(false);
            }
        }
    }

    // Define your API methods
    getUsers() {
        return this.request(() => this.client.get("/users"));
    }

    getUserById(id) {
        return this.request(() => this.client.get(`/users/${id}`));
    }

    createUser(userData) {
        return this.request(() => this.client.post("/users", userData));
    }

    updateUser(id, userData) {
        return this.request(() => this.client.put(`/users/${id}`, userData));
    }

    // Add more API methods as needed...
}
