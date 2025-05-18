// src/components/NotificationsTableComponent/NotificationsTableColumns.jsx
import React from "react";
import { Space, Tag, Button, Dropdown, Avatar } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    BellOutlined,
    ClockCircleOutlined,
    LinkOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserPermission } from "../../hooks/useUserPermission";

const getNotificationsTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
}) => [
    {
        title: "Notification",
        key: "notification",
        align: "left",
        width: 320,
        render: (_, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={50}
                    icon={<BellOutlined />}
                    style={{
                        objectFit: "contain",
                        borderRadius: "6px",
                        backgroundColor: record.repeat ? "#1890ff" : "#52c41a",
                    }}
                >
                    {record.title?.charAt(0) || "N"}
                </Avatar>
                <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                        {record.title || "Untitled Notification"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        ID: {record.id || record._id}
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Text",
        key: "text",
        dataIndex: "text",
        align: "left",
        width: 300,
        ellipsis: true,
        render: (text) => text || "No text provided",
    },
    {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        width: 150,
        render: (date) => (
            <Space>
                {/* <ClockCircleOutlined /> */}
                {moment(date).format("DD MMM, YYYY HH:mm")}
            </Space>
        ),
    },
    {
        title: "Scheduled for",
        dataIndex: "date",
        key: "date",
        align: "center",
        width: 150,
        render: (date) => (
            <Space>
                {/* <ClockCircleOutlined /> */}
                {date ? moment(date).format("DD MMM, YYYY HH:mm") : "NA"}
            </Space>
        ),
    },
    {
        title: "Repeat",
        key: "repeat",
        dataIndex: "repeat",
        align: "center",
        width: 100,
        render: (repeat) =>
            repeat ? (
                <Tag icon={<SyncOutlined spin />} color="blue">
                    Yes
                </Tag>
            ) : (
                <Tag color="default">No</Tag>
            ),
    },
    {
        title: "Frequency",
        key: "frequency",
        dataIndex: "frequency",
        align: "center",
        width: 100,
        render: (frequency) =>
            frequency > 0 ? <span>{frequency} days</span> : <span>-</span>,
    },
    {
        title: "Link",
        key: "link",
        dataIndex: "link",
        align: "center",
        width: 100,
        render: (link) =>
            link ? (
                <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => window.open(link, "_blank")}
                >
                    View
                </Button>
            ) : (
                "-"
            ),
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
            if (can("notifications", "view")) {
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
            if (handleEdit && can("notifications", "edit")) {
                items.push({
                    key: "edit",
                    label: "Edit",
                    icon: <EditOutlined />,
                    onClick: () => {
                        handleEdit(record);
                    },
                });
            }

            // Only add "Delete" option if user has delete permission
            if (handleDelete && can("notifications", "delete")) {
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

export default getNotificationsTableColumns;
