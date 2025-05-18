// Updated ReferralsTableColumns.jsx with referrer information
import React from "react";
import { Space, Tag, Button, Dropdown, Avatar, Tooltip } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    UserOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    HourglassOutlined,
    BookOutlined,
    LinkOutlined,
} from "@ant-design/icons";
import moment from "moment";

const getReferralsTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
    can,
}) => [
    {
        title: "Referred Person",
        key: "referralDetails",
        align: "left",
        width: 220,
        render: (_, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={50}
                    icon={<TeamOutlined />}
                    style={{
                        backgroundColor: getStatusColor(record.status),
                        objectFit: "contain",
                        borderRadius: "6px",
                    }}
                />
                <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                        {record.friendName || "No Name"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        ID: {record.id || record._id}
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Friend's Phone",
        dataIndex: "friendPhone",
        key: "friendPhone",
        align: "center",
        width: 130,
        render: (phone) => phone || "N/A",
    },
    {
        title: "Referred By",
        key: "referredBy",
        align: "left",
        width: 180,
        render: (_, record) => {
            const referrer = record.user;
            if (!referrer) return "Unknown";

            const name = referrer.data?.name
                ? `${referrer.data.name.first || ""} ${
                      referrer.data.name.last || ""
                  }`
                : "Unknown";

            const email = referrer.data?.email;
            const phone = referrer.data?.phone1;

            return (
                <Tooltip title={email ? `Email: ${email}` : ""}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            size={32}
                            src={referrer.data?.imageUrl}
                            icon={<UserOutlined />}
                            style={{ marginRight: 8 }}
                        />
                        <div>
                            <div style={{ fontWeight: 500 }}>{name}</div>
                            {phone && (
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#8c8c8c",
                                    }}
                                >
                                    {phone}
                                </div>
                            )}
                        </div>
                    </div>
                </Tooltip>
            );
        },
    },
    {
        title: "Course",
        key: "course",
        align: "left",
        width: 180,
        render: (_, record) => (
            <div>
                <div style={{ fontWeight: 500 }}>
                    {record.courseDetails?.courseName || "No Course"}
                </div>
                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                    ID: {record.courseDetails?.courseId || "N/A"}
                </div>
                {record.courseDetails?.courseUrl && (
                    <Button
                        type="link"
                        size="small"
                        icon={<LinkOutlined />}
                        onClick={() =>
                            window.open(
                                record.courseDetails.courseUrl,
                                "_blank"
                            )
                        }
                    >
                        Course Link
                    </Button>
                )}
            </div>
        ),
    },
    {
        title: "Status",
        key: "status",
        dataIndex: "status",
        align: "center",
        width: 120,
        render: (status) => getStatusTag(status),
    },
    {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        width: 130,
        render: (date) => (
            <Space>
                <ClockCircleOutlined />
                {moment(date).format("DD MMM, YYYY")}
            </Space>
        ),
    },
    {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 100,
        align: "center",
        render: (_, record) => {
            const items = [];

            if (can("referrals", "view")) {
                items.push({
                    key: "view",
                    label: "View",
                    icon: <EyeOutlined />,
                    onClick: () => {
                        if (handleView) handleView(record);
                    },
                });
            }

            if (can("referrals", "edit")) {
                items.push({
                    key: "edit",
                    label: "Edit",
                    icon: <EditOutlined />,
                    onClick: () => {
                        if (handleEdit) handleEdit(record);
                    },
                });
            }

            if (can("referrals", "delete")) {
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

const getStatusColor = (status) => {
    switch (status) {
        case 1:
            return "#52c41a"; // green - success
        case 0:
            return "#faad14"; // yellow - pending
        case 2:
            return "#ff4d4f"; // red - rejected
        default:
            return "#1890ff"; // blue - unknown
    }
};

const getStatusTag = (status) => {
    switch (status) {
        case 1:
            return (
                <Tag icon={<CheckCircleOutlined />} color="success">
                    Success
                </Tag>
            );
        case 0:
            return (
                <Tag icon={<HourglassOutlined />} color="warning">
                    Pending
                </Tag>
            );
        case 2:
            return (
                <Tag icon={<CloseCircleOutlined />} color="error">
                    Rejected
                </Tag>
            );
        default:
            return <Tag color="default">Unknown</Tag>;
    }
};

export default getReferralsTableColumns;
