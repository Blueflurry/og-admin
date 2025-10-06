// ManageEmployeesViewDrawer.jsx
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
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    HomeOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const ManageEmployeesViewDrawer = ({ open, onClose, employeeData = null }) => {
    if (!employeeData) {
        return null;
    }

    const getFullName = (name) => {
        if (!name) return "Unknown";
        return `${name.first || ""} ${name.middle ? name.middle + " " : ""}${
            name.last || ""
        }`.trim();
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "#ff4d4f"; // Red for admin
            case "manager":
                return "#1890ff"; // Blue for manager
            case "employee":
                return "#52c41a"; // Green for employee
            default:
                return "#faad14"; // Orange for unknown roles
        }
    };

    const capitalizeFirst = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <Drawer
            title="Employee Details"
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
                    size={100}
                    src={employeeData.imageUrl}
                    style={{
                        marginBottom: 16,
                        backgroundColor: getRoleColor(employeeData.role),
                    }}
                    icon={<UserOutlined />}
                >
                    {employeeData.name?.first?.charAt(0) || ""}
                    {employeeData.name?.last?.charAt(0) || ""}
                </Avatar>
                <Title level={4} style={{ margin: 0 }}>
                    {getFullName(employeeData.name)}
                </Title>
                <Space>
                    <Tag color={getRoleColor(employeeData.role)}>
                        {capitalizeFirst(employeeData.role) || "No Role"}
                    </Tag>
                    <Tag color={employeeData.status === 1 ? "green" : "red"}>
                        {employeeData.status === 1 ? "Active" : "Inactive"}
                    </Tag>
                </Space>
            </div>

            <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="Employee ID" span={2}>
                    {employeeData.id || employeeData._id || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="First Name" span={1}>
                    {employeeData.name?.first || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Middle Name" span={1}>
                    {employeeData.name?.middle || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Last Name" span={1}>
                    {employeeData.name?.last || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Role" span={1}>
                    <Tag color={getRoleColor(employeeData.role)}>
                        {capitalizeFirst(employeeData.role) || "No Role"}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Email" span={2}>
                    <Space>
                        <MailOutlined />
                        <a href={`mailto:${employeeData.email}`}>
                            {employeeData.email}
                        </a>
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Phone" span={1}>
                    <Space>
                        <PhoneOutlined />
                        {employeeData.phone1 || "N/A"}
                    </Space>
                </Descriptions.Item>

                {/* <Descriptions.Item label="Date of Birth" span={1}>
                    <Space>
                        <CalendarOutlined />
                        {employeeData.dob
                            ? dayjs(employeeData.dob).format("DD MMM, YYYY")
                            : "N/A"}
                    </Space>
                </Descriptions.Item> */}

                <Descriptions.Item label="Status" span={1}>
                    <Tag color={employeeData.status === 1 ? "green" : "red"}>
                        {employeeData.status === 1 ? "Active" : "Inactive"}
                    </Tag>
                </Descriptions.Item>
            </Descriptions>

            {/* <Divider orientation="left">Address Information</Divider>

            <Descriptions bordered column={2}>
                <Descriptions.Item label="Street Address" span={1}>
                    <Space>
                        <HomeOutlined />
                        {employeeData.address?.street || "N/A"}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Pincode" span={1}>
                    {employeeData.address?.pincode || "N/A"}
                </Descriptions.Item>
            </Descriptions> */}

            <Divider orientation="left">Account Information</Divider>

            <Descriptions bordered column={2}>
                <Descriptions.Item label="Created At" span={1}>
                    {employeeData.createdAt
                        ? dayjs(employeeData.createdAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Last Updated" span={1}>
                    {employeeData.updatedAt
                        ? dayjs(employeeData.updatedAt).format(
                              "DD MMM, YYYY HH:mm"
                          )
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default ManageEmployeesViewDrawer;
