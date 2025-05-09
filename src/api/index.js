import axios from "./axios";

// 1. Define your API class
export class API {
    constructor(setLoading, setError) {
        this.setLoading = setLoading;
        this.setError = setError;
        this.pendingRequests = 0;

        // Create axios instance with defaults
        this.client = axios;
        this.client.get("/auth/csrf");
    }

    // Wrap API calls to track loading state
    async request(requestFn) {
        this.pendingRequests++;
        this.setLoading(true);

        try {
            const result = await requestFn();
            return result.data;
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

    // USERS
    getUsers(page = 1, limit = 10, sort = "") {
        return this.request(() =>
            this.client.post(
                `/auth/search?page=${page}&limit=${limit}&sort=${sort}`
            )
        );
    }

    getUserById(id) {
        return this.request(() => this.client.get(`/auth/${id}`));
    }

    createUser(userData) {
        return this.request(() => this.client.post("/auth", userData));
    }

    updateUser(id, userData) {
        return this.request(() => this.client.patch(`/auth/${id}`, userData));
    }

    // JOBS
    getJobs(page = 1, limit = 10, sort = "", filters = {}) {
        return this.request(() =>
            this.client.post(
                `/jobs/search/admin?page=${page}&limit=${limit}&sort=${sort}`,
                filters
            )
        );
    }

    getJobsConfig() {
        return this.request(() => this.client.get("/jobs/config"));
    }

    getJobById(id) {
        return this.request(() => this.client.get(`/jobs/${id}`));
    }

    createJob(jobData) {
        return this.request(() => this.client.post("/jobs", jobData));
    }

    updateJob(id, jobData) {
        return this.request(() => this.client.patch(`/jobs/${id}`, jobData));
    }

    deleteJob(id) {
        return this.request(() => this.client.delete(`/jobs/${id}`));
    }

    getCompanies() {
        return this.request(() => this.client.post(`/auth/company/search`, {}));
    }

    // Categories API methods (for dropdown in job form)
    getCategories() {
        return this.request(() =>
            this.client.get("/content?limit=1000&type=3")
        );
    }
}
