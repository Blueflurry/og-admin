import React, { useEffect } from "react";
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Space,
    Avatar,
    Descriptions,
    Typography,
} from "antd";
import moment from "moment";

const { Text, Title } = Typography;

const UserViewDrawer = ({ open, onClose, userData = null }) => {
    if (!userData) {
        return null;
    }

    return (
        <Drawer
            title="User Details"
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
                    src={
                        userData.imageUrl || "https://fakeimg.pl/400x400/33FFA1"
                    }
                    size={100}
                    style={{ marginBottom: 16 }}
                />
                <Title level={4} style={{ margin: 0 }}>
                    {`${userData.name?.first || ""} ${
                        userData.name?.middle || ""
                    } ${userData.name?.last || ""}`}
                </Title>
                <Text type="secondary">{userData.email}</Text>
            </div>

            <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="First Name" span={1}>
                    {userData.name?.first || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Middle Name" span={1}>
                    {userData.name?.middle || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Last Name" span={1}>
                    {userData.name?.last || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={1}>
                    {userData.email || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Primary Phone" span={1}>
                    {userData.phone1 ? `+91-${userData.phone1}` : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Secondary Phone" span={1}>
                    {userData.phone2 ? `+91-${userData.phone2}` : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Date of Birth" span={2}>
                    {userData.dob
                        ? moment(userData.dob).format("DD MMM, YYYY")
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>

            <Descriptions
                title="Address Information"
                bordered
                column={2}
                style={{ marginTop: 24 }}
            >
                <Descriptions.Item label="Street Address" span={2}>
                    {userData.address?.street || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="City" span={1}>
                    {userData.address?.city || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="State" span={1}>
                    {userData.address?.state || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Pincode" span={1}>
                    {userData.address?.pincode || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Country" span={1}>
                    {userData.address?.country || "N/A"}
                </Descriptions.Item>
            </Descriptions>

            <Descriptions
                title="Account Information"
                bordered
                column={1}
                style={{ marginTop: 24 }}
            >
                <Descriptions.Item label="Status">
                    <span
                        style={{
                            color:
                                userData.status === 1 ? "#52c41a" : "#ff4d4f",
                            fontWeight: "bold",
                        }}
                    >
                        {userData.status === 1 ? "Active" : "Inactive"}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="User ID">
                    {userData.id || userData._id || "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default UserViewDrawer;
