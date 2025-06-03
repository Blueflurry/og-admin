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
} from "antd";
import {
    HomeOutlined,
    EnvironmentOutlined,
    TagOutlined,
} from "@ant-design/icons";
import moment from "moment";
import ReactMarkdown from "react-markdown";

const { Text, Title } = Typography;

const JobViewDrawer = ({ open, onClose, jobData = null }) => {
    if (!jobData) {
        return null;
    }

    // Helper to render category information
    const renderCategory = () => {
        const { category } = jobData;
        if (!category) return "N/A";

        if (typeof category === "object" && category.title) {
            return (
                <Row gutter={16} align="middle">
                    <Col>
                        {category.imageUrl && (
                            <Avatar
                                src={category.imageUrl}
                                size={32}
                                style={{
                                    marginRight: 8,
                                    objectFit: "contain",
                                }}
                            />
                        )}
                    </Col>
                    <Col>
                        <Tag icon={<TagOutlined />} color="blue">
                            {category.title}
                        </Tag>
                    </Col>
                </Row>
            );
        }

        return <span>{category}</span>;
    };

    return (
        <Drawer
            title="Job Details"
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
            <div style={{ marginBottom: 32, textAlign: "center" }}>
                <Avatar
                    src={jobData.company?.data?.imageUrl || ""}
                    size={100}
                    style={{
                        marginBottom: 16,
                        objectFit: "contain",
                    }}
                >
                    {!jobData.company?.data?.imageUrl &&
                        (jobData.company?.data?.name?.charAt(0) || "J")}
                </Avatar>
                <Title level={4} style={{ margin: 0 }}>
                    {jobData.title || "Untitled Job"}
                </Title>
                <Text type="secondary">
                    {jobData.company?.data?.name || "No Company"}
                </Text>
            </div>

            <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="Job ID" span={2}>
                    {jobData.id || jobData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                    <Tag color={jobData.status === 0 ? "green" : "red"}>
                        {jobData.status === 0 ? "Active" : "Inactive"}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Job Type" span={1}>
                    <Tag color="blue">
                        {jobData.type === 0
                            ? "Internship"
                            : jobData.type === 1
                            ? "Contract"
                            : jobData.type === 2
                            ? "Part-time"
                            : jobData.type === 3
                            ? "Full-time"
                            : "Other"}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Remote" span={1}>
                    {jobData.isRemote ? (
                        <Tag icon={<HomeOutlined />} color="purple">
                            Remote
                        </Tag>
                    ) : (
                        <Tag icon={<EnvironmentOutlined />} color="orange">
                            On-Site
                        </Tag>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Category" span={1}>
                    {renderCategory()}
                </Descriptions.Item>
                <Descriptions.Item label="Salary Range" span={1}>
                    {jobData.salaryRange ||
                        `₹${jobData.minSalary} - ₹${jobData.maxSalary}`}
                </Descriptions.Item>
                <Descriptions.Item label="Experience Required" span={1}>
                    {jobData.minExperience}{" "}
                    {jobData.minExperience === 1 ? "year" : "years"}+
                </Descriptions.Item>
                <Descriptions.Item label="Posted Date" span={1}>
                    {moment(jobData.createdAt).format("DD MMM, YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated" span={1}>
                    {moment(jobData.updatedAt).format("DD MMM, YYYY")}
                </Descriptions.Item>
            </Descriptions>

            <Descriptions
                title="Location Information"
                bordered
                column={2}
                style={{ marginTop: 24 }}
            >
                <Descriptions.Item label="Street" span={2}>
                    {jobData.location?.street || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="City" span={1}>
                    {jobData.location?.city || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="State" span={1}>
                    {jobData.location?.state || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Pincode" span={1}>
                    {jobData.location?.pincode || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Country" span={1}>
                    {jobData.location?.country || "N/A"}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Job Description</Divider>
            <div
                style={{
                    padding: "16px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                }}
            >
                {jobData.description ? (
                    <div className="markdown-content">
                        {/* If you have react-markdown installed */}
                        <ReactMarkdown>{jobData.description}</ReactMarkdown>

                        {/* Alternative if react-markdown is not available */}
                        {/* <div dangerouslySetInnerHTML={{ __html: jobData.description.replace(/\n/g, '<br/>') }} /> */}
                    </div>
                ) : (
                    <Text type="secondary">No description provided</Text>
                )}
            </div>

            <Divider orientation="left">Company Information</Divider>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Company Name">
                    {jobData.company?.data?.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Company Address">
                    {jobData.company?.fullAddress || "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default JobViewDrawer;
