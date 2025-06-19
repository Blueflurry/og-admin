import React from "react";
import { Space, Tag, Button, Dropdown, Avatar } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    LinkOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserPermission } from "../../hooks/useUserPermission";

const getCoursesTableColumns = ({ handleView, handleEdit, handleDelete }) => [
    {
        title: "Course Information",
        key: "courseInfo",
        align: "left",
        width: 250,
        render: (_, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={50}
                    src={record.imageUrl}
                    style={{
                        objectFit: "contain",
                        borderRadius: "6px",
                    }}
                >
                    {record.title?.charAt(0) || "C"}
                </Avatar>
                <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                        {record.title || "Untitled Course"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        ID: {record.id || record._id}
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Duration",
        key: "duration",
        dataIndex: "duration",
        align: "center",
        width: 120,
        render: (duration) => (
            <Space>
                <ClockCircleOutlined />
                {formatDuration(duration)}
            </Space>
        ),
    },
    {
        title: "Enrolled",
        key: "enrolled",
        dataIndex: "enrolled",
        align: "center",
        width: 100,
        render: (enrolled) => (
            <Space>
                <TeamOutlined />
                {enrolled || 0}
            </Space>
        ),
    },
    {
        title: "Start Date",
        dataIndex: "startDate",
        key: "startDate",
        align: "center",
        width: 120,
        render: (date) => (
            <Space>
                <CalendarOutlined />
                {moment(date).format("DD MMM, YYYY")}
            </Space>
        ),
    },
    {
        title: "End Date",
        dataIndex: "endDate",
        key: "endDate",
        align: "center",
        width: 120,
        render: (date) => moment(date).format("DD MMM, YYYY"),
    },
    {
        title: "Links",
        key: "links",
        align: "center",
        width: 100,
        render: (_, record) => (
            <Space size="small">
                {record.courseUrl && (
                    <Button
                        type="link"
                        icon={<LinkOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(record.courseUrl, "_blank");
                        }}
                        title="Course URL"
                    />
                )}
                {record.inviteUrl && (
                    <Button
                        type="link"
                        icon={<TeamOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(record.inviteUrl, "_blank");
                        }}
                        title="Invite URL"
                    />
                )}
                {!record.inviteUrl && !record.courseUrl && (
                    <Button
                        type="link"
                        // icon={<LinkOutlined />}
                        disabled
                        title="No Links Available"
                    >
                        N/A
                    </Button>
                )}
            </Space>
        ),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 100,
        render: (status) => {
            let color, text;

            // Only handle status=1 (Enabled) and status=-1 (Disabled)
            // since status=0 (Webinars) are handled in a separate module
            switch (status) {
                case 1:
                    color = "green";
                    text = "Enabled";
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
        width: 100,
        align: "center",
        render: (_, record) => {
            const { can } = useUserPermission();
            const items = [];

            // Create menu items array for dropdown
            // const items = [
            if (can("courses", "view")) {
                items.push({
                    key: "view",
                    label: "View",
                    icon: <EyeOutlined />,
                    onClick: () => {
                        // console.log("View clicked for record:", record);
                        if (handleView) handleView(record);
                    },
                });
            }

            if (can("courses", "edit")) {
                items.push({
                    key: "edit",
                    label: "Edit",
                    icon: <EditOutlined />,
                    onClick: () => {
                        // console.log("Edit clicked for record:", record);
                        if (handleEdit) handleEdit(record);
                    },
                });
            }
            // ];

            // Only add delete option if handleDelete is provided
            if (handleDelete && can("courses", "delete")) {
                items.push({
                    key: "delete",
                    label: "Delete",
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => {
                        // console.log("Delete clicked for record:", record);
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

// Helper function to format duration in minutes to a readable format
const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return "N/A";

    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return `${hours} hr${hours > 1 ? "s" : ""}`;
        } else {
            return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMinutes} min`;
        }
    }
};

export default getCoursesTableColumns;
