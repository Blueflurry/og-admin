// src/components/JobApplicationsTableComponent/JobApplicationsViewDrawer.jsx
import React from "react";
import {
    Button,
    Drawer,
    Space,
    Avatar,
    Descriptions,
    Typography,
    Tag,
    Divider,
    Row,
    Col,
    Card,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    FileTextOutlined,
    DollarOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    CalendarOutlined,
    BankOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const JobApplicationsViewDrawer = ({
    open,
    onClose,
    applicationData = null,
    jobDetails = null,
}) => {
    if (!applicationData) {
        return null;
    }

    const applicant = applicationData.applicant || {};
    const applicantName = applicant.name
        ? `${applicant.name.first || ""} ${applicant.name.last || ""}`
        : "Unknown Applicant";

    // Helper function to get status tag
    const getStatusTag = (status) => {
        switch (status) {
            case 0:
                return <Tag color="blue">Applied</Tag>;
            case 1:
                return <Tag color="orange">Under Review</Tag>;
            case 2:
                return <Tag color="purple">Shortlisted</Tag>;
            case 3:
                return <Tag color="red">Rejected</Tag>;
            case 4:
                return <Tag color="green">Hired</Tag>;
            default:
                return <Tag color="default">Unknown</Tag>;
        }
    };

    return (
        <Drawer
            title="Application Details"
            width={720}
            onClose={onClose}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
            extra={
                <Space>
                    <Button onClick={onClose}>Close</Button>
                </Space>
            }
        >
            {/* Applicant Header */}
            <div style={{ marginBottom: 32, textAlign: "center" }}>
                <Avatar
                    src={applicant.imageUrl || applicant.imgUrl}
                    size={100}
                    style={{ marginBottom: 16 }}
                    icon={<UserOutlined />}
                />
                <Title level={4} style={{ margin: 0 }}>
                    {applicantName}
                </Title>
                <Space>{getStatusTag(applicationData.status)}</Space>
            </div>

            {/* Application Information */}
            <Descriptions title="Application Information" bordered column={2}>
                <Descriptions.Item label="Application ID" span={2}>
                    {applicationData.id || applicationData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                    {getStatusTag(applicationData.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Applied Date" span={1}>
                    <Space>
                        <ClockCircleOutlined />
                        {applicationData.createdAt
                            ? moment(applicationData.createdAt).format(
                                  "DD MMM, YYYY HH:mm"
                              )
                            : "N/A"}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Experience" span={1}>
                    <Space>
                        <TrophyOutlined />
                        {applicationData.experience !== undefined
                            ? `${applicationData.experience} year${
                                  applicationData.experience !== 1 ? "s" : ""
                              }`
                            : "N/A"}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Expected Salary" span={1}>
                    <Space>
                        <DollarOutlined />
                        {applicationData.expectedSalary
                            ? `₹${applicationData.expectedSalary.toLocaleString()}`
                            : "N/A"}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated" span={2}>
                    <Space>
                        <ClockCircleOutlined />
                        {applicationData.updatedAt
                            ? moment(applicationData.updatedAt).format(
                                  "DD MMM, YYYY HH:mm"
                              )
                            : "N/A"}
                    </Space>
                </Descriptions.Item>
            </Descriptions>

            {/* Resume Section */}
            {applicationData.resumeUrl && (
                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Resume</Title>
                    <Card>
                        <Space>
                            <FileTextOutlined
                                style={{ fontSize: "24px", color: "#1890ff" }}
                            />
                            <div>
                                <div style={{ fontWeight: "bold" }}>
                                    Resume Document
                                </div>
                                <div
                                    style={{ color: "#666", fontSize: "12px" }}
                                >
                                    Click to view resume
                                </div>
                            </div>
                            <Button
                                type="primary"
                                icon={<FileTextOutlined />}
                                onClick={() =>
                                    window.open(
                                        applicationData.resumeUrl,
                                        "_blank"
                                    )
                                }
                            >
                                View Resume
                            </Button>
                        </Space>
                    </Card>
                </div>
            )}

            {/* Job Information */}
            {jobDetails && (
                <>
                    <Divider orientation="left">Job Information</Divider>
                    <Card>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 16,
                            }}
                        >
                            <Avatar
                                size={48}
                                icon={<BankOutlined />}
                                style={{
                                    marginRight: 16,
                                    backgroundColor: "#1890ff",
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: "bold" }}>
                                    {jobDetails.title || "Job Title"}
                                </div>
                                <div style={{ color: "#666" }}>
                                    {jobDetails.company?.data?.name ||
                                        "Company Name"}
                                </div>
                            </div>
                        </div>

                        <Row gutter={16}>
                            <Col span={12}>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Job Type:</strong>{" "}
                                    {jobDetails.type === 0
                                        ? "Internship"
                                        : jobDetails.type === 1
                                        ? "Contract"
                                        : jobDetails.type === 2
                                        ? "Part-time"
                                        : jobDetails.type === 3
                                        ? "Full-time"
                                        : "Other"}
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Remote:</strong>{" "}
                                    {jobDetails.isRemote ? "Yes" : "No"}
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginBottom: 8 }}>
                            <strong>Salary Range:</strong> ₹
                            {jobDetails.minSalary} - ₹{jobDetails.maxSalary}
                        </div>

                        <div>
                            <strong>Min Experience:</strong>{" "}
                            {jobDetails.minExperience} years
                        </div>
                    </Card>
                </>
            )}

            {/* Applicant Details */}
            <Divider orientation="left">Applicant Details</Divider>
            <Descriptions bordered column={2}>
                <Descriptions.Item label="Full Name" span={2}>
                    {applicantName}
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={1}>
                    {applicant.email ? (
                        <a href={`mailto:${applicant.email}`}>
                            <Space>
                                <MailOutlined />
                                {applicant.email}
                            </Space>
                        </a>
                    ) : (
                        "N/A"
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Phone" span={1}>
                    {applicant.phone1 ? (
                        <Space>
                            <PhoneOutlined />
                            {applicant.phone1}
                        </Space>
                    ) : (
                        "N/A"
                    )}
                </Descriptions.Item>
                {applicant.phone2 && (
                    <Descriptions.Item label="Secondary Phone" span={1}>
                        <Space>
                            <PhoneOutlined />
                            {applicant.phone2}
                        </Space>
                    </Descriptions.Item>
                )}
                {applicant.dob && (
                    <Descriptions.Item label="Date of Birth" span={1}>
                        <Space>
                            <CalendarOutlined />
                            {moment(applicant.dob).format("DD MMM, YYYY")}
                        </Space>
                    </Descriptions.Item>
                )}
            </Descriptions>

            {/* Address Information */}
            {applicant.address && (
                <Descriptions
                    title="Address Information"
                    bordered
                    column={2}
                    style={{ marginTop: 24 }}
                >
                    <Descriptions.Item label="Street Address" span={2}>
                        <Space>
                            <HomeOutlined />
                            {applicant.address.street || "N/A"}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="City" span={1}>
                        {applicant.address.city || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="State" span={1}>
                        {applicant.address.state || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Pincode" span={1}>
                        {applicant.address.pincode || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Country" span={1}>
                        {applicant.address.country || "N/A"}
                    </Descriptions.Item>
                </Descriptions>
            )}

            {/* Internal Notes */}
            {applicationData.notes && (
                <>
                    <Divider orientation="left">Internal Notes</Divider>
                    <Card>
                        <Text>{applicationData.notes}</Text>
                    </Card>
                </>
            )}
        </Drawer>
    );
};

export default JobApplicationsViewDrawer;
