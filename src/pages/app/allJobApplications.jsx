// src/pages/app/allJobApplications.jsx
import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message } from "antd";
import JobApplicationsTable from "../../components/JobApplicationsTableComponent/JobApplicationsTable";
import JobApplicationsFormDrawer from "../../components/JobApplicationsTableComponent/JobApplicationsFormDrawer";
import JobApplicationsViewDrawer from "../../components/JobApplicationsTableComponent/JobApplicationsViewDrawer";

const AllJobApplications = () => {
    const { api, isLoading, error } = useAPI();
    const [applications, setApplications] = useState([]);
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
        fetchApplications();
    }, [updateRecords]);

    const fetchApplications = async () => {
        try {
            const { page, limit, sort, filters = {} } = updateRecords;

            console.log("Fetching all job applications with:", {
                page,
                limit,
                sort,
                filters,
            });

            // Use the new getAllJobApplications API method
            const data = await api.getAllJobApplications(
                page,
                limit,
                sort,
                filters
            );
            console.log("All applications data:", data);

            setApplications(data.data.docs || []);

            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                sort: updateRecords.sort,
                totalDocs: data.data.totalDocs || 0,
                ...data.data,
            });
        } catch (err) {
            console.error("Error fetching all applications:", err);
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
            {/* <Breadcrumb
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
                                <span>All Applications</span>
                            </>
                        ),
                    },
                ]}
            /> */}

            <Card
                title={
                    <div>
                        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                            All Job Applications
                        </div>
                        {/* <div
                            style={{
                                fontSize: "14px",
                                color: "#666",
                                marginTop: "4px",
                            }}
                        >
                            View and manage applications from all jobs
                        </div> */}
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
                    jobDetails={null}
                    isGlobalView={true} // New prop to indicate this is global view
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
                    jobDetails={selectedApplication?.job} // Extract job from application data
                />
            </Card>
        </div>
    );
};

export default AllJobApplications;
