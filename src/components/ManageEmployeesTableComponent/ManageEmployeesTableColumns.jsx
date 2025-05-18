// ManageEmployeesTableColumns.jsx
import React from "react";
import { Space, Tag, Button, Dropdown, Avatar } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    LockOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserPermission } from "../../hooks/useUserPermission";

const getManageEmployeesTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
}) => {
    const { can } = useUserPermission();

    return [
        {
            title: "Employee Information",
            key: "employeeInfo",
            align: "left",
            width: 250,
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        size={50}
                        src={record.imageUrl}
                        style={{
                            backgroundColor: getRoleColor(record.role),
                            objectFit: "contain",
                            borderRadius: "6px",
                        }}
                    >
                        {getInitials(record.name)}
                    </Avatar>
                    <div style={{ marginLeft: 12 }}>
                        <div style={{ fontWeight: 500 }}>
                            {getFullName(record.name)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {record.role
                                ? capitalizeFirst(record.role)
                                : "No Role"}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            align: "left",
            width: 220,
            render: (email) => (
                <Space>
                    <MailOutlined />
                    <a href={`mailto:${email}`}>{email}</a>
                </Space>
            ),
        },
        {
            title: "Phone",
            dataIndex: "phone1",
            key: "phone1",
            align: "center",
            width: 150,
            render: (phone) => (
                <Space>
                    <PhoneOutlined />
                    {phone || "N/A"}
                </Space>
            ),
        },
        {
            title: "Date of Birth",
            dataIndex: "dob",
            key: "dob",
            align: "center",
            width: 150,
            render: (dob) => (
                <Space>
                    <CalendarOutlined />
                    {dob ? moment(dob).format("DD MMM, YYYY") : "N/A"}
                </Space>
            ),
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            align: "center",
            width: 120,
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {role ? capitalizeFirst(role) : "No Role"}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 100,
            render: (status) => (
                <Tag color={status === 1 ? "green" : "red"}>
                    {status === 1 ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            width: 120,
            render: (date) => moment(date).format("DD MMM, YYYY"),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 120,
            align: "center",
            render: (_, record) => {
                const items = [];

                if (can("employees", "view")) {
                    items.push({
                        key: "view",
                        label: "View",
                        icon: <EyeOutlined />,
                        onClick: () => {
                            if (handleView) handleView(record);
                        },
                    });
                }

                if (can("employees", "edit")) {
                    items.push({
                        key: "edit",
                        label: "Edit",
                        icon: <EditOutlined />,
                        onClick: () => {
                            if (handleEdit) handleEdit(record);
                        },
                    });
                }

                if (can("employees", "delete")) {
                    items.push({
                        key: "delete",
                        label: "Delete",
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => {
                            if (handleDelete) handleDelete(record);
                        },
                    });
                }

                // Don't render the dropdown if there are no permitted actions
                if (items.length === 0) {
                    return null;
                }

                return (
                    <Space size="middle">
                        <Dropdown menu={{ items }}>
                            <Button>
                                Actions <DownOutlined />
                            </Button>
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];
};

// Helper functions
const getInitials = (name) => {
    if (!name) return "?";
    return `${name.first ? name.first.charAt(0) : ""}${
        name.last ? name.last.charAt(0) : ""
    }`;
};

const getFullName = (name) => {
    if (!name) return "Unknown";
    return `${name.first || ""} ${name.middle ? name.middle + " " : ""}${
        name.last || ""
    }`.trim();
};

const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
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

export default getManageEmployeesTableColumns;
