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
    Tag,
} from "antd";
import dayjs from "dayjs";

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
                <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                    {`${userData.name?.first || ""} ${
                        userData.name?.middle || ""
                    } ${userData.name?.last || ""}`}
                </Title>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                    ID: {userData.id || userData._id || "N/A"}
                </Text>
                {/* <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 12 }}
                >
                    {userData.email}
                </Text> */}
                <div style={{ marginBottom: 8, marginTop: 8 }}>
                    <Tag
                        color={
                            userData.status == 1
                                ? "green"
                                : userData.status == 0
                                ? "gold"
                                : "red"
                        }
                        style={{ fontSize: "14px", padding: "4px 12px" }}
                    >
                        {userData.status == 1
                            ? "Active"
                            : userData.status == 0
                            ? "Unauthorized"
                            : "Disabled"}
                    </Tag>
                </div>
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
                <Descriptions.Item label="Date of Birth" span={1}>
                    {userData.dob
                        ? dayjs(userData.dob).format("DD MMM, YYYY")
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Role" span={1}>
                    {userData.role ? `${userData.role.toUpperCase()}` : "N/A"}
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
                title="Education Information"
                bordered
                column={1}
                style={{ marginTop: 24 }}
            >
                {userData.education &&
                Array.isArray(userData.education) &&
                userData.education.length > 0 ? (
                    userData.education.map((edu, index) => (
                        <Descriptions.Item
                            key={edu._id || index}
                            label={`Education ${index + 1}`}
                            span={1}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                <div>
                                    <Text strong>Course: </Text>
                                    <Text>{edu.name || "N/A"}</Text>
                                </div>
                                <div>
                                    <Text strong>Institution: </Text>
                                    <Text>{edu.institution || "N/A"}</Text>
                                </div>
                                <div>
                                    <Text strong>Start Year: </Text>
                                    <Text>
                                        {edu.startYear
                                            ? dayjs(edu.startYear).format(
                                                  "DD MMM, YYYY"
                                              )
                                            : "N/A"}
                                    </Text>
                                </div>
                                {edu.logo && (
                                    <div>
                                        <Avatar
                                            src={edu.logo}
                                            size={40}
                                            style={{ marginTop: 4 }}
                                        />
                                    </div>
                                )}
                            </div>
                        </Descriptions.Item>
                    ))
                ) : (
                    <Descriptions.Item label="Education" span={1}>
                        No education records available
                    </Descriptions.Item>
                )}
            </Descriptions>

            <Descriptions
                title="Experience Information"
                bordered
                column={1}
                style={{ marginTop: 24 }}
            >
                {userData.experience &&
                Array.isArray(userData.experience) &&
                userData.experience.length > 0 ? (
                    userData.experience.map((exp, index) => (
                        <Descriptions.Item
                            key={exp._id || index}
                            label={`Experience ${index + 1}`}
                            span={1}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                <div>
                                    <Text strong>Title: </Text>
                                    <Text>{exp.title || "N/A"}</Text>
                                </div>
                                <div>
                                    <Text strong>Company: </Text>
                                    <Text>{exp.companyName || "N/A"}</Text>
                                </div>
                                <div>
                                    <Text strong>Employment Type: </Text>
                                    <Text>{exp.employmentType || "N/A"}</Text>
                                </div>
                                <div>
                                    <Text strong>Start Year: </Text>
                                    <Text>
                                        {exp.startYear
                                            ? dayjs(exp.startYear).format(
                                                  "DD MMM, YYYY"
                                              )
                                            : "N/A"}
                                    </Text>
                                </div>
                                {exp.logo && (
                                    <div>
                                        <Avatar
                                            src={exp.logo}
                                            size={40}
                                            style={{ marginTop: 4 }}
                                        />
                                    </div>
                                )}
                            </div>
                        </Descriptions.Item>
                    ))
                ) : (
                    <Descriptions.Item label="Experience" span={1}>
                        No experience records available
                    </Descriptions.Item>
                )}
            </Descriptions>
        </Drawer>
    );
};

export default UserViewDrawer;
