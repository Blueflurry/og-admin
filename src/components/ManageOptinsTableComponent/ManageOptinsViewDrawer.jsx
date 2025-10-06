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
    Image,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const ManageOptinsViewDrawer = ({ open, onClose, optinData = null }) => {
    if (!optinData) {
        return null;
    }

    // Get status label and color
    const getStatusTag = (status) => {
        let color, text;

        switch (status) {
            case 1:
                color = "green";
                text = "Active";
                break;
            case 0:
                color = "orange";
                text = "Inactive";
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
            title="Optin Details"
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
                {optinData.imageUrl ? (
                    <Image
                        src={optinData.imageUrl}
                        alt={optinData.title}
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
                            backgroundColor: "#007BFF",
                        }}
                    >
                        {optinData.title?.charAt(0) || "O"}
                    </Avatar>
                )}
                <Title level={4} style={{ margin: 0 }}>
                    {optinData.title || "Untitled Optin"}
                </Title>
            </div>

            <Descriptions title="Basic Information" bordered column={1}>
                <Descriptions.Item label="Optin ID">
                    {optinData.id || optinData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Optin Title">
                    {optinData.title || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Link">
                    {optinData.link ? (
                        <a
                            href={optinData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {optinData.link}
                        </a>
                    ) : (
                        "No link provided"
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
                {optinData.description ? (
                    <div className="description-content">
                        {optinData.description}
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
                    {optinData.createdAt
                        ? dayjs(optinData.createdAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At" span={1}>
                    {optinData.updatedAt
                        ? dayjs(optinData.updatedAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default ManageOptinsViewDrawer;
