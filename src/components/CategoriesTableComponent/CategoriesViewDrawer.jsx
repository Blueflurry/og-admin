// src/components/CategoriesTableComponent/CategoriesViewDrawer.jsx
import React from "react";
import {
    Button,
    Drawer,
    Space,
    Avatar,
    Descriptions,
    Typography,
    Divider,
    Image,
} from "antd";
import { TagOutlined, LinkOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const CategoriesViewDrawer = ({ open, onClose, categoryData = null }) => {
    if (!categoryData) {
        return null;
    }

    return (
        <Drawer
            title="Category Details"
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
                {categoryData.imageUrl ? (
                    <Image
                        src={categoryData.imageUrl}
                        alt={categoryData.title}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "300px",
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
                        icon={<TagOutlined />}
                    >
                        {categoryData.title?.charAt(0) || "C"}
                    </Avatar>
                )}
                <Title level={4} style={{ margin: 0 }}>
                    {categoryData.title || "Untitled Category"}
                </Title>
            </div>

            <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="Category ID" span={2}>
                    {categoryData.id || categoryData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Title" span={2}>
                    {categoryData.title || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Type" span={1}>
                    {categoryData.type ? `Type ${categoryData.type}` : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Version" span={1}>
                    {categoryData.__v !== undefined
                        ? `v${categoryData.__v}`
                        : "N/A"}
                </Descriptions.Item>
                {categoryData.link && (
                    <Descriptions.Item label="Link" span={2}>
                        <a
                            href={categoryData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Space>
                                <LinkOutlined />
                                {categoryData.link}
                            </Space>
                        </a>
                    </Descriptions.Item>
                )}
            </Descriptions>

            <Divider orientation="left">Description</Divider>
            <div
                style={{
                    padding: "16px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                }}
            >
                {categoryData.description ? (
                    <div className="description-content">
                        {categoryData.description}
                    </div>
                ) : (
                    <Text type="secondary">No description provided</Text>
                )}
            </div>

            <Descriptions
                title="Date Information"
                bordered
                column={2}
                style={{ marginTop: 24 }}
            >
                <Descriptions.Item label="Created At" span={1}>
                    {categoryData.createdAt
                        ? moment(categoryData.createdAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At" span={1}>
                    {categoryData.updatedAt
                        ? moment(categoryData.updatedAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default CategoriesViewDrawer;
