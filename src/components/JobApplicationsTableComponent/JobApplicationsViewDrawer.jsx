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

    // Use actual API structure
    const user = applicationData.user || {};
    const userData = user.data || user;
    const applicantName = userData.name
        ? `${userData.name.first || ""} ${userData.name.last || ""}`
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
            extra={
                <Space>
                    <Button onClick={onClose}>Close</Button>
                </Space>
            }
        >
            {/* Applicant Header */}
            <div style={{ marginBottom: 32, textAlign: "center" }}>
                <Avatar
                    src={userData.imgUrl || userData.imageUrl}
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
                {/* <Descriptions.Item label="Status" span={1}>
                    {getStatusTag(applicationData.status)}
                </Descriptions.Item> */}
                {/* <Descriptions.Item label="Applied Date" span={1}>
                    <Space>
                        /* <ClockCircleOutlined />
                        {applicationData.createdAt
                            ? moment(applicationData.createdAt).format(
                                  "DD MMM, YYYY HH:mm"
                              )
                            : "N/A"}
                    </Space>
                </Descriptions.Item> */}
                <Descriptions.Item label="Applied Date" span={2}>
                    <Space>
                        {/* <ClockCircleOutlined /> */}
                        {applicationData.updatedAt
                            ? moment(applicationData.updatedAt).format(
                                  "DD MMM, YYYY HH:mm"
                              )
                            : "N/A"}
                    </Space>
                </Descriptions.Item>
            </Descriptions>

            {/* Resume Section */}
            {userData.resume?.resumeUrl && (
                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Resume</Title>
                    <Card>
                        <Space>
                            <FileTextOutlined
                                style={{ fontSize: "24px", color: "#1890ff" }}
                            />
                            <div>
                                <div style={{ fontWeight: "bold" }}>
                                    {userData.resume.resumeFileName ||
                                        "Resume Document"}
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
                                        userData.resume.resumeUrl,
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
                                src={jobDetails.company?.data?.imageUrl}
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
                            <strong>Salary Range: </strong>
                            {jobDetails.salaryRange}
                        </div>

                        <div>
                            <strong>Min Experience:</strong>{" "}
                            {jobDetails.experience?.min} years
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
                    {userData.email ? (
                        <a href={`mailto:${userData.email}`}>
                            <Space>
                                <MailOutlined />
                                {userData.email}
                            </Space>
                        </a>
                    ) : (
                        "N/A"
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Phone" span={1}>
                    {userData.phone1 ? (
                        <Space>
                            <PhoneOutlined />
                            {userData.phone1}
                        </Space>
                    ) : (
                        "N/A"
                    )}
                </Descriptions.Item>
                {userData.dob && (
                    <Descriptions.Item label="Date of Birth" span={1}>
                        <Space>
                            <CalendarOutlined />
                            {moment(userData.dob).format("DD MMM, YYYY")}
                        </Space>
                    </Descriptions.Item>
                )}
            </Descriptions>

            {/* Address Information */}
            {userData.address && (
                <Descriptions
                    title="Address Information"
                    bordered
                    column={2}
                    style={{ marginTop: 24 }}
                >
                    <Descriptions.Item label="Street Address" span={2}>
                        <Space>
                            <HomeOutlined />
                            {userData.address.street || "N/A"}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="City" span={1}>
                        {userData.address.city || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="State" span={1}>
                        {userData.address.state || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Pincode" span={1}>
                        {userData.address.pincode || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Country" span={1}>
                        {userData.address.country || "N/A"}
                    </Descriptions.Item>
                </Descriptions>
            )}

            {/* Experience Information */}
            {userData.experience && userData.experience.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Work Experience</Title>
                    <Card>
                        {userData.experience.map((exp, index) => (
                            <div key={index} style={{ marginBottom: 16 }}>
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                    }}
                                >
                                    {exp.title}
                                </div>
                                <div style={{ color: "#666", marginBottom: 4 }}>
                                    {exp.companyName} • {exp.employmentType}
                                </div>
                                <div
                                    style={{ fontSize: "12px", color: "#999" }}
                                >
                                    {exp.startYear} -{" "}
                                    {exp.isCurrent ? "Present " : exp.endYear}
                                    {exp.isCurrent && (
                                        <Tag color="green" size="small">
                                            Current
                                        </Tag>
                                    )}
                                </div>
                                {index < userData.experience.length - 1 && (
                                    <Divider />
                                )}
                            </div>
                        ))}
                    </Card>
                </div>
            )}

            {/* Education Information */}
            {userData.education && userData.education.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Education</Title>
                    <Card>
                        {userData.education.map((edu, index) => (
                            <div key={index} style={{ marginBottom: 16 }}>
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                    }}
                                >
                                    {edu.name}
                                </div>
                                <div style={{ color: "#666", marginBottom: 4 }}>
                                    {edu.institution} • {edu.fieldOfStudy}
                                </div>
                                <div
                                    style={{ fontSize: "12px", color: "#999" }}
                                >
                                    {edu.startYear} -{" "}
                                    {edu.isCurrent ? "Present" : edu.endYear}
                                    {edu.isCurrent && (
                                        <Tag color="green" size="small">
                                            Current
                                        </Tag>
                                    )}
                                </div>
                                {index < userData.education.length - 1 && (
                                    <Divider />
                                )}
                            </div>
                        ))}
                    </Card>
                </div>
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
