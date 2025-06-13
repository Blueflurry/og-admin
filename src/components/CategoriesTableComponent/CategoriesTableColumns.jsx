// src/components/CategoriesTableComponent/CategoriesTableColumns.jsx
import React from "react";
import { Space, Button, Dropdown, Avatar, Tag } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    PictureOutlined,
    TagOutlined,
    LinkOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserPermission } from "../../hooks/useUserPermission";

const getCategoriesTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
}) => [
    {
        title: "Category Information",
        key: "categoryInfo",
        align: "left",
        width: 340,
        render: (_, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={50}
                    src={record.imageUrl}
                    style={{
                        objectFit: "contain",
                        borderRadius: "6px",
                    }}
                    icon={<TagOutlined />}
                >
                    {record.title?.charAt(0) || "C"}
                </Avatar>
                <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                        {record.title || "Untitled Category"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        ID: {record.id || record._id}
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Description",
        key: "description",
        dataIndex: "description",
        align: "left",
        width: 300,
        ellipsis: true,
        render: (description) => description || "No description provided",
    },
    {
        title: "Link",
        key: "link",
        dataIndex: "link",
        align: "center",
        width: 120,
        render: (link) =>
            link ? (
                <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => window.open(link, "_blank")}
                    title="Open Link"
                >
                    Open
                </Button>
            ) : (
                "No link"
            ),
    },
    // {
    //     title: "Type",
    //     key: "type",
    //     dataIndex: "type",
    //     align: "center",
    //     width: 100,
    //     render: (type) => `Type ${type}`,
    // },
    {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        width: 120,
        render: (date) => (date ? moment(date).format("DD MMM, YYYY") : "N/A"),
    },
    {
        title: "Updated At",
        dataIndex: "updatedAt",
        key: "updatedAt",
        align: "center",
        width: 120,
        render: (date) => (date ? moment(date).format("DD MMM, YYYY") : "N/A"),
    },
    {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 100,
        align: "center",
        render: (_, record) => {
            const { can } = useUserPermission();
            const items = [];

            // Only add "View" option if user has view permission
            if (can("categories", "view")) {
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
            if (can("categories", "edit")) {
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
            if (can("categories", "delete") && handleDelete) {
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

export default getCategoriesTableColumns;
