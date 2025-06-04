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
import { BankOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const ManageInstitutesViewDrawer = ({
    open,
    onClose,
    instituteData = null,
}) => {
    if (!instituteData) {
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
            title="Institute Details"
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
                {instituteData.imageUrl ? (
                    <Image
                        src={instituteData.imageUrl}
                        alt={instituteData.title}
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
                        {instituteData.title?.charAt(0) || "I"}
                    </Avatar>
                )}
                <Title level={4} style={{ margin: 0 }}>
                    {instituteData.title || "Untitled Institute"}
                </Title>
            </div>

            <Descriptions title="Basic Information" bordered column={1}>
                <Descriptions.Item label="Institute ID">
                    {instituteData.id || instituteData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Institute Name">
                    {instituteData.title || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Website">
                    {instituteData.link ? (
                        <a
                            href={instituteData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {instituteData.link}
                        </a>
                    ) : (
                        "No website URL provided"
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
                {instituteData.description ? (
                    <div className="description-content">
                        {instituteData.description}
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
                    {instituteData.createdAt
                        ? moment(instituteData.createdAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At" span={1}>
                    {instituteData.updatedAt
                        ? moment(instituteData.updatedAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default ManageInstitutesViewDrawer;
