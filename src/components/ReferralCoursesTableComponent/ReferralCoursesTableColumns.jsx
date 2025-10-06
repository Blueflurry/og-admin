import React from "react";
import { Space, Button, Dropdown, Tooltip } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const getReferralCoursesTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
    can,
}) => [
    {
        title: "Course Name",
        dataIndex: "title",
        key: "title",
        align: "left",
        width: 250,
        render: (title, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                        {title || "No Course Name"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        ID: {record.id || record._id}
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "University Name",
        dataIndex: "description",
        key: "description",
        align: "left",
        width: 200,
        render: (description) => (
            <div style={{ maxWidth: 350 }}>
                {description ? (
                    description.length > 100 ? (
                        <Tooltip title={description}>
                            {description.substring(0, 100)}...
                        </Tooltip>
                    ) : (
                        description
                    )
                ) : (
                    "No University Name"
                )}
            </div>
        ),
    },
    {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        width: 130,
        render: (date) => <Space>{dayjs(date).format("DD MMM, YYYY")}</Space>,
    },
    {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 100,
        align: "center",
        render: (_, record) => {
            const items = [];

            if (can("referralCourses", "view")) {
                items.push({
                    key: "view",
                    label: "View",
                    icon: <EyeOutlined />,
                    onClick: () => {
                        if (handleView) handleView(record);
                    },
                });
            }

            if (can("referralCourses", "edit")) {
                items.push({
                    key: "edit",
                    label: "Edit",
                    icon: <EditOutlined />,
                    onClick: () => {
                        if (handleEdit) handleEdit(record);
                    },
                });
            }

            if (can("referralCourses", "delete")) {
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

export default getReferralCoursesTableColumns;
