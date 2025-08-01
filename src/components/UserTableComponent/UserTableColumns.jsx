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
// import PermissionGate from "../../components/PermissionGate";
import { useUserPermission } from "../../hooks/useUserPermission";

const getUserTableColumns = ({ handleView, handleEdit, handleDelete }) => {
    return [
        {
            title: "User Information",
            key: "userInfo",
            align: "left",
            width: 320,
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        size={50}
                        src={
                            record.imageUrl ||
                            record.imgUrl ||
                            record.img ||
                            "https://fakeimg.pl/400x400/33FFA1"
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
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 140,
            render: (status) => {
                let color, text;

                switch (status) {
                    case "1":
                    case 1:
                        color = "green";
                        text = "Active";
                        break;
                    case "0":
                    case 0:
                        color = "gold";
                        text = "Unauthorized";
                        break;
                    case "-1":
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
            title: "Email",
            dataIndex: "email",
            key: "email",
            align: "left",
            width: 250,
            render: (email) =>
                email ? <a href={`mailto:${email}`}>{email}</a> : "N/A",
        },
        {
            title: "User Role",
            dataIndex: "role",
            key: "role",
            align: "center",
            width: 100,
            // sorter: true,
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
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            width: 150,
            // sorter: true,
            render: (createdAt) =>
                createdAt ? moment(createdAt).format("DD MMM, YYYY") : "N/A",
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
            width: 200,
            ellipsis: true,
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

                const streetParts = address?.street?.split(",");

                const part1 = address.city
                    ? address.city
                    : streetParts && streetParts?.length > 3
                    ? streetParts[streetParts?.length - 3]
                    : streetParts && streetParts?.length > 2
                    ? streetParts[streetParts?.length - 2]
                    : streetParts && streetParts?.length > 1
                    ? streetParts[1]
                    : streetParts && streetParts?.length > 0
                    ? streetParts[0]
                    : "";

                let part2,
                    part3 = null;
                console.log(part1, streetParts);
                console.log(address);

                if (part1 && part1?.length && part1?.length < 20) {
                    part2 = address.state
                        ? address.state
                        : streetParts?.length > 3
                        ? streetParts[streetParts?.length - 2]
                        : streetParts?.length > 2
                        ? streetParts[0]
                        : null;

                    part3 = address.country
                        ? address.country
                        : streetParts?.length > 3
                        ? streetParts[1]
                        : null;
                }

                // Create a truncated version for the table cell
                const displayAddress = [part1, part2, part3]
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
                                    wordBreak: "break-word",
                                    wordWrap: "break-word",
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
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 120,
            align: "center",
            render: (_, record) => {
                const { can } = useUserPermission();
                const items = [];

                // Create menu items array for dropdown
                // const items = [
                if (can("users", "view")) {
                    items.push({
                        key: "view",
                        label: "View",
                        icon: <EyeOutlined />,
                        onClick: () => {
                            if (handleView) handleView(record);
                        },
                    });
                }

                if (can("users", "edit")) {
                    items.push({
                        key: "edit",
                        label: "Edit",
                        icon: <EditOutlined />,
                        onClick: () => {
                            if (handleEdit) handleEdit(record);
                        },
                    });
                }
                // ];

                // Only add delete option if handleDelete is provided
                if (handleDelete && can("users", "delete")) {
                    items.push({
                        key: "delete",
                        label: "Delete",
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => {
                            handleDelete(record);
                        },
                    });
                }

                // Don't render the dropdown if there are no permitted actions
                if (items?.length === 0) {
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

export default getUserTableColumns;
