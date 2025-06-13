// src/pages/app/jobApplications.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAPI } from "../../hooks/useAPI";
import {
    Card,
    message,
    Row,
    Col,
    Statistic,
    Avatar,
    Typography,
    Space,
    Tag,
    // Breadcrumb,
    Divider,
    Button,
    Tooltip,
} from "antd";
import {
    HomeOutlined,
    UserOutlined,
    BankOutlined,
    TeamOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    DollarOutlined,
    TrophyOutlined,
    FileTextOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import JobApplicationsTable from "../../components/JobApplicationsTableComponent/JobApplicationsTable";
import JobApplicationsFormDrawer from "../../components/JobApplicationsTableComponent/JobApplicationsFormDrawer";
import JobApplicationsViewDrawer from "../../components/JobApplicationsTableComponent/JobApplicationsViewDrawer";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Title, Text } = Typography;

const JobApplications = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
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
            console.log("Job details fetched:", data);
            setJobDetails(data.data || data);
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
            console.log("Applications data received:", data);

            // Handle the response structure - the API should return populated user data
            const applicationsData = data.data?.docs || data.data || [];
            setApplications(applicationsData);

            // Update pagination
            setPagination({
                page: data.data?.page || updateRecords.page,
                limit: data.data?.limit || updateRecords.limit,
                sort: updateRecords.sort,
                totalDocs: data.data?.totalDocs || applicationsData.length || 0,
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

    // Calculate application statistics
    const getApplicationStats = () => {
        const stats = {
            total: pagination.totalDocs || 0,
            applied: 0,
            underReview: 0,
            shortlisted: 0,
            hired: 0,
            rejected: 0,
        };

        applications.forEach((app) => {
            switch (app.status) {
                case 0:
                    stats.applied++;
                    break;
                case 1:
                    stats.underReview++;
                    break;
                case 2:
                    stats.shortlisted++;
                    break;
                case 3:
                    stats.rejected++;
                    break;
                case 4:
                    stats.hired++;
                    break;
            }
        });

        return stats;
    };

    const stats = getApplicationStats();

    // Get job type display
    const getJobTypeDisplay = (type) => {
        const types = {
            0: { label: "Internship", color: "#1890ff" },
            1: { label: "Contract", color: "#fa8c16" },
            2: { label: "Part-time", color: "#52c41a" },
            3: { label: "Full-time", color: "#722ed1" },
        };
        return types[type] || { label: "Unknown", color: "#d9d9d9" };
    };

    if (isLoading && applications.length === 0) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div style={{ padding: "0 4px" }}>
            {/* Breadcrumb Navigation */}
            {/* <Breadcrumb
                style={{ marginBottom: 24 }}
                items={[
                    {
                        href: "/",
                        title: (
                            <Space>
                                <HomeOutlined />
                                <span>Dashboard</span>
                            </Space>
                        ),
                    },
                    {
                        href: "/jobs",
                        title: (
                            <Space>
                                <BankOutlined />
                                <span>Jobs</span>
                            </Space>
                        ),
                    },
                    {
                        title: (
                            <Space>
                                <UserOutlined />
                                <span>Applications</span>
                            </Space>
                        ),
                    },
                ]}
            /> */}

            {/* Back Button */}
            <div style={{ marginBottom: 16 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/jobs")}
                    type="text"
                    style={{
                        color: "#04248c",
                        fontSize: "14px",
                        padding: "4px 8px",
                        height: "auto",
                    }}
                >
                    Back to Jobs
                </Button>
            </div>

            {/* Job Information Header */}
            {jobDetails && (
                <Card
                    style={{
                        marginBottom: 24,
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <Row gutter={[24, 16]} align="middle">
                        <Col xs={24} md={16}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 16,
                                }}
                            >
                                <Avatar
                                    size={80}
                                    src={jobDetails.company?.data?.imageUrl}
                                    style={{
                                        // backgroundColor: "#04248c",
                                        color: "white",
                                        fontSize: "28px",
                                        flexShrink: 0,
                                    }}
                                >
                                    {jobDetails.company?.data?.name?.charAt(
                                        0
                                    ) || "J"}
                                </Avatar>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Title
                                        level={3}
                                        style={{
                                            margin: "0 0 4px 0",
                                            color: "#04248c",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {jobDetails.title}
                                    </Title>
                                    <Text
                                        strong
                                        style={{
                                            fontSize: "16px",
                                            color: "#52c41a",
                                            display: "block",
                                            marginBottom: 8,
                                        }}
                                    >
                                        {jobDetails.company?.data?.name ||
                                            "Company"}
                                    </Text>
                                    <Space wrap size={[8, 8]}>
                                        <Tag
                                            color={
                                                getJobTypeDisplay(
                                                    jobDetails.type
                                                ).color
                                            }
                                            style={{ borderRadius: 12 }}
                                        >
                                            {
                                                getJobTypeDisplay(
                                                    jobDetails.type
                                                ).label
                                            }
                                        </Tag>
                                        {jobDetails.isRemote ? (
                                            <Tag
                                                icon={<HomeOutlined />}
                                                color="purple"
                                                style={{ borderRadius: 12 }}
                                            >
                                                Remote
                                            </Tag>
                                        ) : (
                                            <Tag
                                                icon={<EnvironmentOutlined />}
                                                color="orange"
                                                style={{ borderRadius: 12 }}
                                            >
                                                {jobDetails.location?.city},{" "}
                                                {jobDetails.location?.state}
                                            </Tag>
                                        )}
                                        <Tag
                                            icon={<TrophyOutlined />}
                                            color="gold"
                                            style={{ borderRadius: 12 }}
                                        >
                                            {jobDetails.minExperience}+ years
                                        </Tag>
                                        <Tag
                                            icon={<DollarOutlined />}
                                            color="green"
                                            style={{ borderRadius: 12 }}
                                        >
                                            ₹
                                            {jobDetails.minSalary?.toLocaleString()}{" "}
                                            - ₹
                                            {jobDetails.maxSalary?.toLocaleString()}
                                        </Tag>
                                        <Tag
                                            icon={<CalendarOutlined />}
                                            color="blue"
                                            style={{ borderRadius: 12 }}
                                        >
                                            Posted{" "}
                                            {moment(
                                                jobDetails.createdAt
                                            ).format("MMM DD, YYYY")}
                                        </Tag>
                                    </Space>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div style={{ textAlign: "center" }}>
                                <Statistic
                                    title={
                                        <Space>
                                            <TeamOutlined
                                                style={{ color: "#04248c" }}
                                            />
                                            <span>Total Applications</span>
                                        </Space>
                                    }
                                    value={stats.total}
                                    valueStyle={{
                                        color: "#04248c",
                                        fontSize: "32px",
                                        fontWeight: "bold",
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Application Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={8} md={4}>
                    <Card
                        size="small"
                        style={{
                            textAlign: "center",
                            borderRadius: 8,
                            border: "1px solid #e8f4ff",
                        }}
                    >
                        <Statistic
                            title="Applied"
                            value={stats.applied}
                            valueStyle={{ color: "#1890ff", fontSize: "20px" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card
                        size="small"
                        style={{
                            textAlign: "center",
                            borderRadius: 8,
                            border: "1px solid #fff7e6",
                        }}
                    >
                        <Statistic
                            title="Sent to Company"
                            value={stats.underReview}
                            valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card
                        size="small"
                        style={{
                            textAlign: "center",
                            borderRadius: 8,
                            border: "1px solid #f9f0ff",
                        }}
                    >
                        <Statistic
                            title="Offered"
                            value={stats.shortlisted}
                            valueStyle={{ color: "#722ed1", fontSize: "20px" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card
                        size="small"
                        style={{
                            textAlign: "center",
                            borderRadius: 8,
                            border: "1px solid #f6ffed",
                        }}
                    >
                        <Statistic
                            title="Accepted"
                            value={stats.hired}
                            valueStyle={{ color: "#52c41a", fontSize: "20px" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card
                        size="small"
                        style={{
                            textAlign: "center",
                            borderRadius: 8,
                            border: "1px solid #fff2f0",
                        }}
                    >
                        <Statistic
                            title="Rejected"
                            value={stats.rejected}
                            valueStyle={{ color: "#ff4d4f", fontSize: "20px" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card
                        size="small"
                        style={{
                            textAlign: "center",
                            borderRadius: 8,
                            border: "1px solid #e6f7ff",
                            background:
                                "linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)",
                        }}
                    >
                        <Statistic
                            title="Success Rate"
                            value={
                                stats.total > 0
                                    ? Math.round(
                                          (stats.hired / stats.total) * 100
                                      )
                                    : 0
                            }
                            suffix="%"
                            valueStyle={{
                                color: "#04248c",
                                fontSize: "20px",
                                fontWeight: "bold",
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Applications Table */}
            <Card
                title={
                    <Space>
                        <FileTextOutlined style={{ color: "#04248c" }} />
                        <span style={{ color: "#04248c", fontWeight: "600" }}>
                            Application Management
                        </span>
                    </Space>
                }
                style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
                loading={isLoading}
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
