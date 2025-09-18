// src/components/JobApplicationsTableComponent/JobApplicationsTableColumns.jsx
import React from "react";
import { Space, Tag, Button, Dropdown, Avatar, Tooltip } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    DollarOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserPermission } from "../../hooks/useUserPermission";

const getJobApplicationsTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
}) => {
    const { can } = useUserPermission();

    return [
        {
            title: "Applicant",
            key: "applicant",
            align: "left",
            width: 340,
            render: (_, record) => {
                // Use 'user' instead of 'applicant' from actual API
                const user = record.user || {};
                const userData = user.data || user;
                const name = userData?.fullName
                    ? userData?.fullName
                    : userData.name
                    ? `${userData.name.first || ""} ${userData.name.last || ""}`
                    : "Unknown Applicant";

                return (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            size={50}
                            src={userData.imgUrl || userData.imageUrl}
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            icon={<UserOutlined />}
                        />
                        <div style={{ marginLeft: 12 }}>
                            <div style={{ fontWeight: 500 }}>{name}</div>
                            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                                ID: {record.id || record._id}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Contact Info",
            key: "contact",
            align: "left",
            width: 280,
            render: (_, record) => {
                const user = record.user || {};
                const userData = user.data || user;
                return (
                    <div>
                        {userData.email && (
                            <div style={{ marginBottom: 4 }}>
                                <MailOutlined
                                    style={{ marginRight: 4, color: "#1890ff" }}
                                />
                                <a
                                    href={`mailto:${userData.email}`}
                                    style={{ fontSize: "12px" }}
                                >
                                    {userData.email}
                                </a>
                            </div>
                        )}
                        {userData.phone1 && (
                            <div>
                                <PhoneOutlined
                                    style={{ marginRight: 4, color: "#52c41a" }}
                                />
                                <span style={{ fontSize: "12px" }}>
                                    {userData.phone1}
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Experience",
            key: "experience",
            align: "center",
            width: 120,
            render: (_, record) => {
                const user = record.user || {};
                const userData = user.data || user;
                const experience = userData.experience || [];
                const experienceYears = experience.length;

                return (
                    <Space>
                        <TrophyOutlined style={{ color: "#faad14" }} />
                        {experienceYears > 0
                            ? `${experienceYears} exp${
                                  experienceYears !== 1 ? "s" : ""
                              }`
                            : "N/A"}
                    </Space>
                );
            },
        },
        {
            title: "Education",
            key: "education",
            align: "center",
            width: 140,
            render: (_, record) => {
                const user = record.user || {};
                const userData = user.data || user;
                const education = userData.education || [];
                const latestEducation =
                    education.find((edu) => edu.isCurrent) || education[0];

                return (
                    <div>
                        {latestEducation ? (
                            <div style={{ fontSize: "12px" }}>
                                <div style={{ fontWeight: 500 }}>
                                    {latestEducation.name}
                                </div>
                                <div style={{ color: "#8c8c8c" }}>
                                    {latestEducation.institution}
                                </div>
                            </div>
                        ) : (
                            "N/A"
                        )}
                    </div>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 130,
            render: (status) => {
                const statusConfig = getStatusConfig(status);
                return (
                    <Tag color={statusConfig.color} icon={statusConfig.icon}>
                        {statusConfig.text}
                    </Tag>
                );
            },
        },
        {
            title: "Applied Date",
            dataIndex: "updatedAt",
            key: "updatedAt",
            align: "center",
            width: 130,
            render: (date) => moment(date).format("DD MMM, YYYY"),
        },
        {
            title: "Resume",
            key: "resume",
            align: "center",
            width: 100,
            render: (_, record) => {
                const user = record.user || {};
                const userData = user.data || user;
                const resumeUrl = userData.resume?.resumeUrl;

                if (resumeUrl) {
                    return (
                        <Button
                            type="link"
                            onClick={() => window.open(resumeUrl, "_blank")}
                        >
                            View Resume
                        </Button>
                    );
                }
                return "-";
            },
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 100,
            align: "center",
            render: (_, record) => {
                const items = [];

                if (can("jobApplications", "view")) {
                    items.push({
                        key: "view",
                        label: "View",
                        icon: <EyeOutlined />,
                        onClick: () => {
                            if (handleView) handleView(record);
                        },
                    });
                }

                if (can("jobApplications", "edit")) {
                    items.push({
                        key: "edit",
                        label: "Edit",
                        icon: <EditOutlined />,
                        onClick: () => {
                            if (handleEdit) handleEdit(record);
                        },
                    });
                }

                if (can("jobApplications", "delete") && handleDelete) {
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

// Helper function to get status configuration
const getStatusConfig = (status) => {
    switch (status) {
        case 0:
            return {
                color: "blue",
                text: "Applied",
                icon: null,
            };
        case 1:
            return {
                color: "orange",
                text: "Under Review",
                icon: null,
            };
        case 2:
            return {
                color: "purple",
                text: "Shortlisted",
                icon: null,
            };
        case 3:
            return {
                color: "red",
                text: "Rejected",
                icon: null,
            };
        case 4:
            return {
                color: "green",
                text: "Hired",
                icon: null,
            };
        default:
            return {
                color: "default",
                text: "Unknown",
                icon: null,
            };
    }
};

export default getJobApplicationsTableColumns;
