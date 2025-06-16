import React from "react";
import { Space, Tag, Button, Dropdown, Avatar } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    HomeOutlined,
    BuildOutlined,
} from "@ant-design/icons";
import moment from "moment";

const getManageCompaniesTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
    can,
}) => {
    return [
        {
            title: "Company Information",
            key: "companyInfo",
            align: "left",
            width: 250,
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        size={50}
                        src={record.data?.imageUrl || null}
                        style={{
                            objectFit: "contain",
                            borderRadius: "6px",
                        }}
                    >
                        {record.data?.name?.charAt(0) || "C"}
                    </Avatar>
                    <div style={{ marginLeft: 12 }}>
                        <div style={{ fontWeight: 500 }}>
                            {record.data?.name || "Unnamed Company"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            ID: {record.id || record._id}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Address",
            key: "fullAddress",
            align: "left",
            width: 300,
            render: (_, record) => {
                // Try to use the fullAddress field if available
                let formattedAddress = record.fullAddress;

                // If address is not available, format from the address object
                if (!formattedAddress && record.address) {
                    if (typeof record.address === "object") {
                        const parts = [];
                        if (record.address.street)
                            parts.push(record.address.street);
                        if (record.address.city)
                            parts.push(record.address.city);
                        if (record.address.state)
                            parts.push(record.address.state);
                        if (record.address.pincode)
                            parts.push(record.address.pincode);
                        if (record.address.country)
                            parts.push(record.address.country);

                        formattedAddress = parts.join(", ");
                    } else if (typeof record.address === "string") {
                        formattedAddress = record.address;
                    }
                }

                return (
                    <div style={{ maxWidth: "280px" }}>
                        <Space>
                            <HomeOutlined />
                            <span
                                style={{
                                    wordWrap: "break-word",
                                    whiteSpace: "normal",
                                    lineHeight: "1.4",
                                }}
                                title={formattedAddress}
                            >
                                {formattedAddress || "No address provided"}
                            </span>
                        </Space>
                    </div>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 100,
            render: (status) => {
                const statusConfig = {
                    1: { color: "green", text: "Active" },
                    0: { color: "orange", text: "Inactive" },
                    [-1]: { color: "red", text: "Disabled" },
                };
                const config = statusConfig[status] || {
                    color: "default",
                    text: "Unknown",
                };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
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
            title: "Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
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
                // Create menu items array for dropdown
                const items = [];

                // Only add "View" option if user has view permission
                if (can("companies", "view")) {
                    items.push({
                        key: "view",
                        label: "View",
                        icon: <EyeOutlined />,
                        onClick: () => {
                            if (handleView) handleView(record);
                        },
                    });
                }

                // Only add "Edit" option if user has edit permission
                if (can("companies", "edit")) {
                    items.push({
                        key: "edit",
                        label: "Edit",
                        icon: <EditOutlined />,
                        onClick: () => {
                            if (handleEdit) handleEdit(record);
                        },
                    });
                }

                // Only add "Delete" option if user has delete permission and handleDelete exists
                if (can("companies", "delete") && handleDelete) {
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

export default getManageCompaniesTableColumns;
