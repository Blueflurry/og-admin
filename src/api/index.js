import axios from "./axios";

// 1. Define your API class
export class API {
    constructor(setLoading, setError) {
        this.setLoading = setLoading;
        this.setError = setError;
        this.pendingRequests = 0;

        // Create axios instance with defaults
        this.client = axios;
        // this.client.get("/auth/csrf");
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

    // AUTH
    login(email, password) {
        return this.request(() =>
            this.client.post("/auth/admin/login", { email, password })
        );
    }

    // USERS
    getUsers(page = 1, limit = 10, sort = "", filters = {}) {
        // Always use POST with filters in the body
        return this.request(() =>
            this.client.post(
                `/auth/search?page=${page}&limit=${limit}&sort=${sort}`,
                filters || {} // Ensure we always send an object, even if filters is undefined
            )
        );
    }

    getUserById(id) {
        return this.request(() => this.client.get(`/auth/${id}`));
    }

    createUser(userData) {
        return this.request(() => this.client.post("/auth/register", userData));
    }

    updateUser(id, userData) {
        return this.request(() => this.client.patch(`/auth/${id}`, userData));
    }

    deleteUser(id) {
        return this.request(() => this.client.delete(`/auth/${id}`));
    }

    getUsersConfig() {
        return this.request(() => this.client.get("/auth/config"));
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

    // Updated API methods for Courses with filter support
    getCourses(page = 1, limit = 10, sort = "", filters = {}) {
        // Start with pagination parameters
        let queryParams = `page=${page}&limit=${limit}`;

        // Add sort if provided
        if (sort) {
            queryParams += `&sort=${sort}`;
        }

        // Get status from filters or use default status=1 for courses
        const status =
            filters && filters.status !== undefined ? filters.status : 1;
        queryParams += `&status=${status}`;

        // Process remaining filters and add them to the query string
        if (filters && Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([key, value]) => {
                // Skip status as it's already processed
                if (key === "status") return;

                if (typeof value === "object") {
                    // Handle MongoDB operators ($regex, $in, $gte, $lte, etc.)
                    Object.entries(value).forEach(([operator, opValue]) => {
                        // Keep MongoDB operators intact
                        const paramOperator = operator;

                        if (Array.isArray(opValue) && operator === "$in") {
                            // Handle $in operator with array values
                            opValue.forEach((item) => {
                                queryParams += `&${key}[${paramOperator}][]=${encodeURIComponent(
                                    item
                                )}`;
                            });
                        } else {
                            // Handle other operators
                            queryParams += `&${key}[${paramOperator}]=${encodeURIComponent(
                                opValue
                            )}`;
                        }
                    });
                } else {
                    // Handle simple values
                    queryParams += `&${key}=${encodeURIComponent(value)}`;
                }
            });
        }

        // console.log("Query Params:", filters, `${queryParams}`);
        // Make the request with all query parameters
        return this.request(() => this.client.get(`/courses?${queryParams}`));
    }

    // For webinars, just call the same API but with status=0
    getWebinars(page = 1, limit = 10, sort = "", filters = {}) {
        // Ensure we set status=0 for webinars
        const webinarFilters = { ...filters, status: 0 };
        // Remove any conflicting status value that might have been set
        delete webinarFilters.status;
        webinarFilters.status = 0;

        // console.log("HEREEEEE", page, limit, sort, webinarFilters);
        return this.getCourses(page, limit, sort, webinarFilters);
    }

    getCourseById(id) {
        return this.request(() => this.client.get(`/courses/${id}`));
    }

    getWebinarById(id) {
        // Same API as courses, the backend differentiates by the status field
        return this.getCourseById(id);
    }

    createCourse(courseData) {
        // FormData is handled automatically by axios
        return this.request(() => this.client.post("/courses", courseData));
    }

    createWebinar(webinarData) {
        // Check if webinarData is FormData
        if (webinarData instanceof FormData) {
            // Ensure status is set to 0 for webinars
            webinarData.set("status", 0);
        } else {
            // If it's a regular object
            webinarData = {
                ...webinarData,
                status: 0,
            };
        }

        // Use the same API as createCourse
        return this.createCourse(webinarData);
    }

    updateCourse(id, courseData) {
        // Handle both FormData and regular objects
        return this.request(() =>
            this.client.patch(`/courses/${id}`, courseData)
        );
    }

    updateWebinar(id, webinarData) {
        // Use the same API as courses
        return this.updateCourse(id, webinarData);
    }

    deleteCourse(id) {
        return this.request(() => this.client.delete(`/courses/${id}`));
    }

    deleteWebinar(id) {
        // Same API as deleting courses
        return this.deleteCourse(id);
    }

    // Company API methods
    getManageCompanies(params = {}) {
        if (params.sort == "") {
            params.sort = "-createdAt";
        }

        const {
            page = 1,
            limit = 10,
            sort = "-createdAt",
            filters = {},
        } = params;

        console.log(params);

        return this.request(() =>
            this.client.post("/auth/company/search/admin", filters, {
                params: { page, limit, sort },
            })
        );
    }

    getManageCompany(id) {
        return this.request(() => this.client.get(`/auth/company/${id}`));
    }

    createManageCompany(data) {
        // For FormData (with image upload)
        return this.request(() =>
            this.client.post("/auth/company", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
        );
    }

    updateManageCompany(id, data) {
        // For FormData (with image upload)
        return this.request(() =>
            this.client.patch(`/auth/company/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
        );
    }

    deleteManageCompany(id) {
        return this.request(() => this.client.delete(`/auth/company/${id}`));
    }

    // Institutes API methods (type=1)
    getInstitutes(params = {}) {
        if (params.sort == "") {
            params.sort = "-createdAt";
        }

        const {
            page = 1,
            limit = 10,
            sort = "-createdAt",
            filters = {},
        } = params;

        // Make sure type=1 is included in the filters
        const instituteFilters = { ...filters, type: 1 };

        return this.request(() =>
            this.client.post("/content/search", instituteFilters, {
                params: { page, limit, sort },
            })
        );
    }

    getInstitute(id) {
        return this.request(() => this.client.get(`/content/${id}`));
    }

    createInstitute(data) {
        return this.request(() =>
            this.client.post("/content", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
        );
    }

    updateInstitute(id, data) {
        return this.request(() =>
            this.client.patch(`/content/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
        );
    }

    deleteInstitute(id) {
        return this.request(() => this.client.delete(`/content/${id}`));
    }

    // ManageOptins API methods (type=0)
    getManageOptins(params = {}) {
        if (params.sort == "") {
            params.sort = "-createdAt";
        }
        const {
            page = 1,
            limit = 10,
            sort = "-createdAt",
            filters = {},
        } = params;

        // Make sure type=0 is included in the filters
        const optinFilters = { ...filters, type: 0 };

        return this.request(() =>
            this.client.post("/content/search", optinFilters, {
                params: { page, limit, sort },
            })
        );
    }

    getManageOptin(id) {
        return this.request(() => this.client.get(`/content/${id}`));
    }

    createManageOptin(data) {
        return this.request(() =>
            this.client.post("/content", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
        );
    }

    updateManageOptin(id, data) {
        return this.request(() =>
            this.client.patch(`/content/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
        );
    }

    deleteManageOptin(id) {
        return this.request(() => this.client.delete(`/content/${id}`));
    }

    // API methods in index.js
    getNotifications(page = 1, limit = 10, sort = "-date", filters = {}) {
        return this.request(() =>
            this.client.get(`/cron?page=${page}&limit=${limit}&sort=${sort}`, {
                params: filters,
            })
        );
    }

    getNotificationById(id) {
        return this.request(() => this.client.get(`/cron/${id}`));
    }

    createNotification(notificationData) {
        return this.request(() => this.client.post("/cron", notificationData));
    }

    updateNotification(id, notificationData) {
        return this.request(() =>
            this.client.patch(`/cron/${id}`, notificationData)
        );
    }

    deleteNotification(id) {
        return this.request(() => this.client.delete(`/cron/${id}`));
    }

    // REFERRALS
    getReferrals(page = 1, limit = 10, sort = "", filters = {}) {
        // Start with pagination parameters
        let queryParams = `page=${page}&limit=${limit}&populate=user`;

        // Add sort if provided
        if (sort) {
            queryParams += `&sort=${sort}`;
        }

        // Process filters and convert to MongoDB query format
        if (filters && Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([key, value]) => {
                if (typeof value === "object") {
                    // Handle MongoDB operators ($regex, $in, $gte, etc.)
                    Object.entries(value).forEach(([operator, opValue]) => {
                        if (Array.isArray(opValue) && operator === "$in") {
                            // Handle $in operator with array values
                            opValue.forEach((item) => {
                                queryParams += `&${key}[${operator}][]=${encodeURIComponent(
                                    item
                                )}`;
                            });
                        } else {
                            // Handle other operators
                            queryParams += `&${key}[${operator}]=${encodeURIComponent(
                                opValue
                            )}`;
                        }
                    });
                } else {
                    // Handle simple values
                    queryParams += `&${key}=${encodeURIComponent(value)}`;
                }
            });
        }

        return this.request(() =>
            this.client.get(`/referral?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
        );
    }

    getReferralById(id) {
        return this.request(() =>
            this.client.get(`/referral/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
        );
    }

    // createReferral(referralData) {
    //     return this.request(() => this.client.post("/referral", referralData));
    // }

    updateReferral(id, referralData) {
        return this.request(() =>
            this.client.patch(`/referral/${id}`, referralData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
        );
    }

    deleteReferral(id) {
        return this.request(() =>
            this.client.delete(`/referral/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
        );
    }

    // Employees API methods
    getManageEmployees(params = {}) {
        const {
            page = 1,
            limit = 10,
            sort = "-createdAt",
            filters = {},
        } = params;

        // Always include the role filter to get only employees, managers, and admins
        const employeeFilters = {
            ...filters,
            appUserRole: { $in: [2, 3, 5] }, // 2=employee, 3=manager, 5=admin
        };

        // Use the search POST endpoint with the filters in the body
        return this.request(() =>
            this.client.post(
                `/auth/search?page=${page}&limit=${limit}&sort=${sort}`,
                employeeFilters
            )
        );
    }

    getManageEmployee(id) {
        // Use the regular user GET endpoint
        return this.request(() => this.client.get(`/auth/${id}`));
    }

    createManageEmployee(data) {
        // Set default role to 2 (employee) if not specified
        if (!data.has("appUserRole")) {
            data.append("appUserRole", 2);
        }

        // Use the register/admin endpoint for employee creation
        return this.request(() =>
            this.client.post("/auth/register/admin", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
        );
    }

    updateManageEmployee(id, data) {
        // Use the regular user PATCH endpoint
        return this.request(() =>
            this.client.patch(`/auth/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
        );
    }

    deleteManageEmployee(id) {
        // Use the regular user DELETE endpoint
        return this.request(() => this.client.delete(`/auth/${id}`));
    }
}
