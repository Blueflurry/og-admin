// src/pages/app/jobApplications.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAPI } from "../../hooks/useAPI";
import { Card, message, Breadcrumb } from "antd";
import { HomeOutlined, UserOutlined, BankOutlined } from "@ant-design/icons";
import JobApplicationsTable from "../../components/JobApplicationsTableComponent/JobApplicationsTable";
import JobApplicationsFormDrawer from "../../components/JobApplicationsTableComponent/JobApplicationsFormDrawer";
import JobApplicationsViewDrawer from "../../components/JobApplicationsTableComponent/JobApplicationsViewDrawer";
import { useAuth } from "../../contexts/AuthContext";
import { useUserPermission } from "../../hooks/useUserPermission";

const JobApplications = () => {
    const authDebug = useAuth();
    console.log("🔍 AUTH DEBUG in JobApplications:", authDebug);
    console.log("🔍 AUTH DEBUG keys:", Object.keys(authDebug || {}));

    const permissionDebug = useUserPermission();
    console.log("🔍 PERMISSION DEBUG:", permissionDebug);
    console.log(
        "🔍 PERMISSION DEBUG keys:",
        Object.keys(permissionDebug || {})
    );

    const { jobId } = useParams();
    const { api, isLoading, error } = useAPI();
    const [applications, setApplications] = useState([]);
    const [jobDetails, setJobDetails] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "-createdAt",
        filters: {},
    });

    // State for drawers
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    useEffect(() => {
        console.log("JobApplications mounted, jobId:", jobId);

        if (jobId) {
            fetchJobDetails();
            fetchApplications();
        }
    }, [jobId, updateRecords]);

    const fetchJobDetails = async () => {
        try {
            const data = await api.getJobById(jobId);
            setJobDetails(data.data);
        } catch (err) {
            console.error("Error fetching job details:", err);
            message.error("Failed to fetch job details");
        }
    };

    const fetchApplications = async () => {
        try {
            const { page, limit, sort, filters = {} } = updateRecords;

            console.log("Fetching applications with:", {
                jobId,
                page,
                limit,
                sort,
                filters,
            });

            const data = await api.getJobApplications(
                jobId,
                page,
                limit,
                sort,
                filters
            );
            console.log("Applications data:", data);

            setApplications(data.data.docs || []);

            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                sort: updateRecords.sort,
                totalDocs: data.data.totalDocs || 0,
                ...data.data,
            });
        } catch (err) {
            console.error("Error fetching applications:", err);
            message.error("Failed to fetch job applications");
        }
    };

    const handleUpdateRecords = (newRecords) => {
        console.log("Updating records with:", newRecords);
        setUpdateRecords((prevRecords) => ({
            ...prevRecords,
            ...newRecords,
        }));
    };

    // Handlers for CRUD operations
    const handleEdit = (application) => {
        console.log("Edit application:", application);
        setSelectedApplication(application);
        setFormDrawerOpen(true);
    };

    const handleView = (application) => {
        console.log("View application:", application);
        setSelectedApplication(application);
        setViewDrawerOpen(true);
    };

    const handleDelete = async (application) => {
        try {
            const applicationId = application.id || application._id;
            console.log("Deleting application with ID:", applicationId);

            await api.deleteJobApplication(applicationId);
            console.log("Deleted application");

            message.success("Application deleted successfully");
            fetchApplications();
        } catch (error) {
            console.error("Error deleting application:", error);
            message.error("Failed to delete application");
        }
    };

    const handleBulkUpdate = async (selectedIds, updateData) => {
        try {
            console.log("Bulk updating applications:", selectedIds, updateData);

            await api.bulkUpdateJobApplications({
                ids: selectedIds,
                update: updateData,
            });

            message.success(
                `${selectedIds.length} applications updated successfully`
            );
            fetchApplications();
        } catch (error) {
            console.error("Error bulk updating applications:", error);
            message.error("Failed to update applications");
        }
    };

    const handleFormSuccess = () => {
        console.log("Form submitted successfully");
        fetchApplications();
    };

    if (isLoading && applications.length === 0) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {/* Breadcrumb */}
            <Breadcrumb
                style={{ marginBottom: 16 }}
                items={[
                    {
                        href: "/",
                        title: <HomeOutlined />,
                    },
                    {
                        href: "/jobs",
                        title: (
                            <>
                                <BankOutlined />
                                <span>Jobs</span>
                            </>
                        ),
                    },
                    {
                        title: (
                            <>
                                <UserOutlined />
                                <span>Applications</span>
                            </>
                        ),
                    },
                ]}
            />

            <Card
                title={
                    <div>
                        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                            Job Applications
                        </div>
                        {jobDetails && (
                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "#666",
                                    marginTop: "4px",
                                }}
                            >
                                for "{jobDetails.title}"
                            </div>
                        )}
                    </div>
                }
            >
                <JobApplicationsTable
                    applicationData={applications}
                    pagination={pagination}
                    setUpdateRecords={handleUpdateRecords}
                    handleView={handleView}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleBulkUpdate={handleBulkUpdate}
                    jobDetails={jobDetails}
                />

                {/* Form drawer for edit */}
                <JobApplicationsFormDrawer
                    open={formDrawerOpen}
                    onClose={() => setFormDrawerOpen(false)}
                    initialValues={selectedApplication}
                    onSuccess={handleFormSuccess}
                />

                {/* View drawer for detailed view */}
                <JobApplicationsViewDrawer
                    open={viewDrawerOpen}
                    onClose={() => setViewDrawerOpen(false)}
                    applicationData={selectedApplication}
                    jobDetails={jobDetails}
                />
            </Card>
        </div>
    );
};

export default JobApplications;
