// Updated ReferralsViewDrawer.jsx with comprehensive referrer information
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
    TeamOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    HourglassOutlined,
    PhoneOutlined,
    BookOutlined,
    LinkOutlined,
    MailOutlined,
    HomeOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const ReferralsViewDrawer = ({ open, onClose, referralData = null }) => {
    if (!referralData) {
        return null;
    }

    // Helper function to get status tag
    const getStatusTag = (status) => {
        switch (status) {
            case 1:
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Success
                    </Tag>
                );
            case 0:
                return (
                    <Tag icon={<HourglassOutlined />} color="warning">
                        Pending
                    </Tag>
                );
            case 2:
                return (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                        Rejected
                    </Tag>
                );
            default:
                return <Tag color="default">Unknown</Tag>;
        }
    };

    // User information (referrer)
    const user = referralData.user || {};
    const userName = user.data?.name
        ? `${user.data.name.first || ""} ${user.data.name.last || ""}`
        : "Unknown";

    return (
        <Drawer
            title="Referral Details"
            width={720}
            onClose={onClose}
            open={open}
            extra={
                <Space>
                    <Button onClick={onClose}>Close</Button>
                </Space>
            }
        >
            <div style={{ marginBottom: 32, textAlign: "center" }}>
                <Avatar
                    size={80}
                    icon={<TeamOutlined />}
                    style={{
                        marginBottom: 16,
                        backgroundColor:
                            referralData.status === 1
                                ? "#52c41a"
                                : referralData.status === 2
                                ? "#ff4d4f"
                                : "#faad14",
                    }}
                />
                <Title level={4} style={{ margin: 0 }}>
                    {referralData.friendName || "No Name"}
                </Title>
                <Space>{getStatusTag(referralData.status)}</Space>
            </div>

            <Descriptions title="Referral Information" bordered column={2}>
                <Descriptions.Item label="Referral ID" span={2}>
                    {referralData.id || referralData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Friend's Name" span={1}>
                    {referralData.friendName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Friend's Phone" span={1}>
                    <Space>
                        <PhoneOutlined />
                        {referralData.friendPhone || "N/A"}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                    {getStatusTag(referralData.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Created Date" span={1}>
                    {referralData.createdAt
                        ? moment(referralData.createdAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated" span={2}>
                    {referralData.updatedAt
                        ? moment(referralData.updatedAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>

            {/* Referrer Information Section */}
            <Divider orientation="left">Referrer Information</Divider>

            <Card bordered style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <Avatar
                        size={64}
                        src={user.data?.imageUrl}
                        icon={<UserOutlined />}
                        style={{ marginRight: 16 }}
                    />
                    <div>
                        <Title level={5} style={{ margin: 0 }}>
                            {userName}
                        </Title>

                        {user.data?.email && (
                            <div style={{ marginTop: 8 }}>
                                <MailOutlined style={{ marginRight: 8 }} />
                                <a href={`mailto:${user.data.email}`}>
                                    {user.data.email}
                                </a>
                            </div>
                        )}

                        {user.data?.phone1 && (
                            <div style={{ marginTop: 4 }}>
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                {user.data.phone1}
                            </div>
                        )}

                        {user.fullAddress && (
                            <div style={{ marginTop: 4 }}>
                                <HomeOutlined style={{ marginRight: 8 }} />
                                {user.fullAddress}
                            </div>
                        )}

                        {user.data?.dob && (
                            <div style={{ marginTop: 4 }}>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                {moment(user.data.dob).format("DD MMM, YYYY")}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Divider orientation="left">Course Information</Divider>

            <Card bordered>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <Avatar
                        size={48}
                        icon={<BookOutlined />}
                        style={{ marginRight: 16, backgroundColor: "#1890ff" }}
                    />
                    <div>
                        <div style={{ fontWeight: "bold" }}>
                            {referralData.courseDetails?.courseName ||
                                "No Course"}
                        </div>
                        <div>
                            Course ID:{" "}
                            {referralData.courseDetails?.courseId || "N/A"}
                        </div>
                    </div>
                </div>

                {referralData.courseDetails?.courseUrl && (
                    <Button
                        type="primary"
                        icon={<LinkOutlined />}
                        onClick={() =>
                            window.open(
                                referralData.courseDetails.courseUrl,
                                "_blank"
                            )
                        }
                    >
                        Open Course URL
                    </Button>
                )}
            </Card>
        </Drawer>
    );
};

export default ReferralsViewDrawer;
