import React from "react";
import {
    Button,
    Drawer,
    Space,
    Avatar,
    Descriptions,
    Typography,
    Divider,
    Row,
    Col,
    Image,
} from "antd";
import { HomeOutlined, GlobalOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const ManageCompaniesViewDrawer = ({ open, onClose, companyData = null }) => {
    if (!companyData) {
        return null;
    }

    return (
        <Drawer
            title="Company Details"
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
                {companyData.data?.imageUrl ? (
                    <Image
                        src={companyData.data.imageUrl}
                        alt={companyData.data?.name}
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
                        {companyData.data?.name?.charAt(0) || "C"}
                    </Avatar>
                )}
                <Title level={4} style={{ margin: 0 }}>
                    {companyData.data?.name || "Unnamed Company"}
                </Title>
            </div>

            <Descriptions title="Basic Information" bordered column={1}>
                <Descriptions.Item label="Company ID">
                    {companyData.id || companyData._id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Company Name">
                    {companyData.data.name || "N/A"}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Address</Divider>
            <div
                style={{
                    padding: "16px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                }}
            >
                <Space>
                    <HomeOutlined />
                    {
                        // companyData.fullAddress ? (
                        //     <div className="address-content">
                        //         {companyData.fullAddress}
                        //     </div>
                        // ) :
                        companyData.address ? (
                            <div className="address-content">
                                {typeof companyData.address === "object" ? (
                                    <>
                                        {/* {companyData.address.street && (
                                        <div>{companyData.address.street}</div>
                                    )} */}
                                        {companyData.address.city && (
                                            <div>
                                                {companyData.address.city}
                                            </div>
                                        )}
                                        {/* {companyData.address.state && (
                                            <div>
                                                {companyData.address.state}
                                                {companyData.address.pincode &&
                                                    ` - ${companyData.address.pincode}`}
                                            </div>
                                        )} */}
                                        {/* {companyData.address.country && (
                                            <div>
                                                {companyData.address.country}
                                            </div>
                                        )} */}
                                    </>
                                ) : (
                                    companyData.address
                                )}
                            </div>
                        ) : (
                            <Text type="secondary">No address provided</Text>
                        )
                    }
                </Space>
            </div>

            <Descriptions
                title="Dates Information"
                bordered
                column={2}
                style={{ marginTop: 24 }}
            >
                <Descriptions.Item label="Created At" span={1}>
                    {companyData.createdAt
                        ? moment(companyData.createdAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At" span={1}>
                    {companyData.updatedAt
                        ? moment(companyData.updatedAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default ManageCompaniesViewDrawer;
