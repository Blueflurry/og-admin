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
    Image,
} from "antd";
import {
    CalendarOutlined,
    TeamOutlined,
    LinkOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const WebinarsViewDrawer = ({ open, onClose, courseData = null }) => {
    if (!courseData) {
        return null;
    }

    // Format duration for display
    const formatDuration = (minutes) => {
        if (!minutes && minutes !== 0) return "N/A";

        if (minutes < 60) {
            return `${minutes} minutes`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;

            if (remainingMinutes === 0) {
                return `${hours} hour${hours > 1 ? "s" : ""}`;
            } else {
                return `${hours} hour${
                    hours > 1 ? "s" : ""
                } ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
            }
        }
    };

    // Get status label and color
    const getStatusTag = (status) => {
        let color, text;

        switch (status) {
            case 0:
                color = "blue";
                text = "Enabled";
                break;
            case 1:
                color = "green";
                text = "Enabled";
                break;
            case -1:
                color = "red";
                text = "Disabled";
                break;
            default:
                color = "default";
                text = "Unknown";
        }

        return <Tag color={color}>{text}</Tag>;
    };

    return (
        <Drawer
            title="Webinar Details"
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
                {courseData.imageUrl ? (
                    <Image
                        src={courseData.imageUrl}
                        alt={courseData.title}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            objectFit: "contain",
                            marginBottom: 16,
                        }}
                    />
                ) : (
                    <Avatar
                        size={100}
                        style={{
                            marginBottom: 16,
                            backgroundColor: "#1890ff",
                        }}
                        icon={<VideoCameraOutlined />}
                    >
                        {courseData.title?.charAt(0) || "W"}
                    </Avatar>
                )}
                <Title level={4} style={{ margin: 0 }}>
                    {courseData.title || "Untitled Webinar"}
                </Title>
                <Text type="secondary">{getStatusTag(courseData.status)}</Text>
            </div>

            <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="Webinar ID" span={2}>
                    {courseData.id || courseData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Title" span={2}>
                    {courseData.title || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Duration" span={1}>
                    <Space>{formatDuration(courseData.duration)}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="Enrolled Students" span={1}>
                    <Space>
                        <TeamOutlined />
                        {courseData.enrolled || 0}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Start Date" span={1}>
                    <Space>
                        <CalendarOutlined />
                        {moment(courseData.startDate).format("DD MMM, YYYY")}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="End Date" span={1}>
                    <Space>
                        <CalendarOutlined />
                        {moment(courseData.endDate).format("DD MMM, YYYY")}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Category" span={1}>
                    {courseData.category
                        ? typeof courseData.category === "object"
                            ? courseData.category.title
                            : courseData.category
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                    {getStatusTag(courseData.status)}
                </Descriptions.Item>
            </Descriptions>

            <Descriptions
                title="URLs"
                bordered
                column={1}
                style={{ marginTop: 24 }}
            >
                <Descriptions.Item label="Webinar URL">
                    {courseData.courseUrl ? (
                        <a
                            href={courseData.courseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Space>
                                <LinkOutlined />
                                {courseData.courseUrl}
                            </Space>
                        </a>
                    ) : (
                        "N/A"
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Invite URL">
                    {courseData.inviteUrl ? (
                        <a
                            href={courseData.inviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Space>
                                <LinkOutlined />
                                {courseData.inviteUrl}
                            </Space>
                        </a>
                    ) : (
                        "N/A"
                    )}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Description</Divider>
            <div
                style={{
                    padding: "16px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                }}
            >
                {courseData.description ? (
                    <div className="description-content">
                        {courseData.description}
                    </div>
                ) : (
                    <Text type="secondary">No description provided</Text>
                )}
            </div>

            <Descriptions
                title="Dates Information"
                bordered
                column={2}
                style={{ marginTop: 24 }}
            >
                <Descriptions.Item label="Created At" span={1}>
                    {moment(courseData.createdAt).format("DD MMM, YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At" span={1}>
                    {moment(courseData.updatedAt).format("DD MMM, YYYY HH:mm")}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default WebinarsViewDrawer;
