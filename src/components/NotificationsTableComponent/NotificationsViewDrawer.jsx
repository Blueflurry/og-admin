// src/components/NotificationsTableComponent/NotificationsViewDrawer.jsx
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
    Card,
} from "antd";
import {
    BellOutlined,
    ClockCircleOutlined,
    LinkOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const NotificationsViewDrawer = ({
    open,
    onClose,
    notificationData = null,
}) => {
    if (!notificationData) {
        return null;
    }

    return (
        <Drawer
            title="Notification Details"
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
                    icon={<BellOutlined />}
                    style={{
                        marginBottom: 16,
                        backgroundColor: notificationData.repeat
                            ? "#1890ff"
                            : "#52c41a",
                    }}
                />
                <Title level={4} style={{ margin: 0 }}>
                    {notificationData.title || "Untitled Notification"}
                </Title>
                {notificationData.repeat && (
                    <Tag icon={<SyncOutlined spin />} color="blue">
                        Repeating ({notificationData.frequency} days)
                    </Tag>
                )}
            </div>

            <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="Notification ID" span={2}>
                    {notificationData.id || notificationData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Title" span={2}>
                    {notificationData.title || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Scheduled Date" span={1}>
                    <Space>
                        {/* <ClockCircleOutlined /> */}
                        {notificationData.date
                            ? moment(notificationData.date).format(
                                  "DD MMM, YYYY HH:mm"
                              )
                            : "N/A"}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Repeat" span={1}>
                    {notificationData.repeat ? (
                        <Tag icon={<SyncOutlined spin />} color="blue">
                            Yes
                        </Tag>
                    ) : (
                        <Tag color="default">No</Tag>
                    )}
                </Descriptions.Item>
                {notificationData.repeat && (
                    <Descriptions.Item label="Frequency" span={2}>
                        {notificationData.frequency > 0
                            ? `Every ${notificationData.frequency} days`
                            : "N/A"}
                    </Descriptions.Item>
                )}
                {notificationData.link && (
                    <Descriptions.Item label="Link" span={2}>
                        <a
                            href={notificationData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Space>
                                <LinkOutlined />
                                {notificationData.link}
                            </Space>
                        </a>
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Created At" span={1}>
                    <Space>
                        {/* <ClockCircleOutlined />  */}
                        {notificationData.createdAt
                            ? moment(notificationData.createdAt).format(
                                  "DD MMM, YYYY HH:mm"
                              )
                            : "N/A"}
                    </Space>
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Notification Text</Divider>
            <Card>
                <div style={{ whiteSpace: "pre-wrap" }}>
                    {notificationData.text || "No text content"}
                </div>
            </Card>
        </Drawer>
    );
};

export default NotificationsViewDrawer;
