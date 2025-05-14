import React from "react";
import { Space, Tag, Button, Dropdown, Avatar } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    BankOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserPermission } from "../../hooks/useUserPermission";

const ManageGetInstitutesTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
}) => {
    const { can } = useUserPermission();

    return [
        {
            title: "Institute Information",
            key: "instituteInfo",
            align: "left",
            width: 250,
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        size={50}
                        src={record.imageUrl || null}
                        style={{
                            objectFit: "contain",
                            borderRadius: "6px",
                        }}
                    >
                        {record.title?.charAt(0) || "I"}
                    </Avatar>
                    <div style={{ marginLeft: 12 }}>
                        <div style={{ fontWeight: 500 }}>
                            {record.title || "Untitled Institute"}
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
                        onClick={() => window.open(link, "_blank")}
                    >
                        Visit Website
                    </Button>
                ) : (
                    "No link"
                ),
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            width: 120,
            render: (date) =>
                date ? moment(date).format("DD MMM, YYYY") : "N/A",
        },
        {
            title: "Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
            align: "center",
            width: 120,
            render: (date) =>
                date ? moment(date).format("DD MMM, YYYY") : "N/A",
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
                if (can("institutes", "view")) {
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
                if (can("institutes", "edit")) {
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
                if (can("institutes", "delete") && handleDelete) {
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

export default ManageGetInstitutesTableColumns;
