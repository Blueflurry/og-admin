// Updated UserTableColumns.jsx with complete address details
import React from "react";
import { Space, Avatar, Tag, Button, Dropdown, Tooltip } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import moment from "moment";

const getUserTableColumns = ({ handleView, handleEdit, handleDelete }) => {
    console.log("getUserTableColumns received handleDelete:", !!handleDelete); // Debug

    return [
        {
            title: "User Information",
            key: "userInfo",
            align: "left",
            width: 250,
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        size={50}
                        src={
                            record.imageUrl ||
                            record.imgUrl ||
                            record.img ||
                            "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                        }
                        style={{
                            objectFit: "contain",
                            borderRadius: "50%",
                        }}
                    />
                    <div style={{ marginLeft: 12 }}>
                        <div style={{ fontWeight: 500 }}>
                            {record.name?.first || ""}
                            {record.name?.middle
                                ? ` ${record.name.middle} `
                                : " "}
                            {record.name?.last || ""}
                        </div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            ID: {record.id || record._id}
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
            render: (email) =>
                email ? <a href={`mailto:${email}`}>{email}</a> : "N/A",
        },
        {
            title: "Primary Phone",
            dataIndex: "phone1",
            key: "phone",
            align: "center",
            width: 150,
            render: (phone) => (phone ? `+91-${phone}` : "N/A"),
        },
        {
            title: "Date of Birth",
            dataIndex: "dob",
            key: "dob",
            align: "center",
            width: 120,
            render: (dob) => (dob ? moment(dob).format("DD MMM, YYYY") : "N/A"),
        },
        {
            title: "Location",
            dataIndex: "address",
            key: "address",
            align: "left",
            width: 120,
            render: (address) => {
                if (!address) return "N/A";

                // Create a complete address string with all details
                const fullAddress = [
                    address.street,
                    address.city,
                    address.state,
                    address.pincode,
                    address.country,
                ]
                    .filter(Boolean) // Remove empty/undefined values
                    .join(", ");

                // Create a truncated version for the table cell
                const displayAddress = [
                    address.street,
                    address.city,
                    address.state,
                    address.pincode,
                    address.country,
                ]
                    .filter(Boolean)
                    .join(", ");

                // Show a tooltip with the full address on hover
                return (
                    <Tooltip title={fullAddress}>
                        <Space>
                            <EnvironmentOutlined />
                            <span
                                style={{
                                    maxWidth: "120px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {displayAddress || "N/A"}
                                {/* {address.pincode ? ` - ${address.pincode}` : ""} */}
                            </span>
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            width: 150,
            sorter: true,
            render: (createdAt) =>
                createdAt ? moment(createdAt).format("DD MMM, YYYY") : "N/A",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 100,
            render: (status) => {
                let color, text;

                switch (status) {
                    case 1:
                        color = "green";
                        text = "Active";
                        break;
                    case 0:
                        color = "gold";
                        text = "Unauthorized";
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
            },
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 100,
            align: "center",
            render: (_, record) => {
                // Create menu items array for dropdown
                const items = [
                    {
                        key: "view",
                        label: "View",
                        icon: <EyeOutlined />,
                        onClick: () => {
                            console.log("View clicked for record:", record);
                            if (handleView) handleView(record);
                        },
                    },
                    {
                        key: "edit",
                        label: "Edit",
                        icon: <EditOutlined />,
                        onClick: () => {
                            console.log("Edit clicked for record:", record);
                            if (handleEdit) handleEdit(record);
                        },
                    },
                ];

                // Only add delete option if handleDelete is provided
                if (handleDelete) {
                    items.push({
                        key: "delete",
                        label: "Delete",
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => {
                            console.log("Delete clicked for record:", record);
                            handleDelete(record);
                        },
                    });
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

export default getUserTableColumns;
