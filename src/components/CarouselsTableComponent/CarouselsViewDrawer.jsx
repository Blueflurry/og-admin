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
import { PictureOutlined, LinkOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const CarouselsViewDrawer = ({ open, onClose, carouselData = null }) => {
    if (!carouselData) {
        return null;
    }

    return (
        <Drawer
            title="Carousel Details"
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
                {carouselData.imageUrl ? (
                    <Image
                        src={carouselData.imageUrl}
                        alt={carouselData.title}
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
                        icon={<PictureOutlined />}
                    >
                        {carouselData.title?.charAt(0) || "C"}
                    </Avatar>
                )}
                <Title level={4} style={{ margin: 0 }}>
                    {carouselData.title || "Untitled Carousel"}
                </Title>
            </div>

            <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="Carousel ID" span={2}>
                    {carouselData.id || carouselData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Title" span={2}>
                    {carouselData.title || "N/A"}
                </Descriptions.Item>
                {/* <Descriptions.Item label="Type" span={1}>
                    {carouselData.type ? `Type ${carouselData.type}` : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Version" span={1}>
                    {carouselData.__v !== undefined
                        ? `v${carouselData.__v}`
                        : "N/A"}
                </Descriptions.Item> */}
                {carouselData.link && (
                    <Descriptions.Item label="Link" span={2}>
                        <a
                            href={carouselData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Space>
                                <LinkOutlined />
                                {carouselData.link}
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
                {carouselData.description ? (
                    <div className="description-content">
                        {carouselData.description}
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
                    {carouselData.createdAt
                        ? moment(carouselData.createdAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At" span={1}>
                    {carouselData.updatedAt
                        ? moment(carouselData.updatedAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default CarouselsViewDrawer;
