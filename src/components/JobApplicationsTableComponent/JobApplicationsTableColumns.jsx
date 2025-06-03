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
            width: 250,
            render: (_, record) => {
                const applicant = record.applicant || {};
                const name = applicant.name
                    ? `${applicant.name.first || ""} ${
                          applicant.name.last || ""
                      }`
                    : "Unknown Applicant";

                return (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            size={50}
                            src={applicant.imageUrl || applicant.imgUrl}
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
            width: 200,
            render: (_, record) => {
                const applicant = record.applicant || {};
                return (
                    <div>
                        {applicant.email && (
                            <div style={{ marginBottom: 4 }}>
                                <MailOutlined
                                    style={{ marginRight: 4, color: "#1890ff" }}
                                />
                                <a
                                    href={`mailto:${applicant.email}`}
                                    style={{ fontSize: "12px" }}
                                >
                                    {applicant.email}
                                </a>
                            </div>
                        )}
                        {applicant.phone1 && (
                            <div>
                                <PhoneOutlined
                                    style={{ marginRight: 4, color: "#52c41a" }}
                                />
                                <span style={{ fontSize: "12px" }}>
                                    {applicant.phone1}
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Experience",
            dataIndex: "experience",
            key: "experience",
            align: "center",
            width: 120,
            render: (experience) => (
                <Space>
                    <TrophyOutlined style={{ color: "#faad14" }} />
                    {experience !== undefined
                        ? `${experience} yr${experience !== 1 ? "s" : ""}`
                        : "N/A"}
                </Space>
            ),
        },
        {
            title: "Expected Salary",
            dataIndex: "expectedSalary",
            key: "expectedSalary",
            align: "center",
            width: 140,
            render: (salary) => (
                <Space>
                    <DollarOutlined style={{ color: "#52c41a" }} />
                    {salary ? `₹${salary.toLocaleString()}` : "N/A"}
                </Space>
            ),
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
            dataIndex: "createdAt",
            key: "createdAt",
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
                if (record.resumeUrl) {
                    return (
                        <Button
                            type="link"
                            onClick={() =>
                                window.open(record.resumeUrl, "_blank")
                            }
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

                // Changed from "jobs" to "jobApplications"
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

                // Changed from "jobs" to "jobApplications"
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

                // Changed from "jobs" to "jobApplications"
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
