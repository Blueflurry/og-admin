// src/components/JobApplicationsTableComponent/GlobalJobApplicationsColumns.jsx
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
    BankOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserPermission } from "../../hooks/useUserPermission";

const getGlobalJobApplicationsColumns = ({
    handleView,
    handleEdit,
    handleDelete,
}) => {
    const { can } = useUserPermission();

    return [
        {
            title: "Applicants",
            key: "applicant",
            align: "left",
            width: 340,
            render: (_, record) => {
                const user = record.user || {};
                const userData = user.data || user;
                const name = userData.name
                    ? `${userData.name.first || ""} ${userData.name.last || ""}`
                    : "Unknown Applicant";

                return (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            size={40}
                            src={userData.imgUrl || userData.imageUrl}
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            icon={<UserOutlined />}
                        />
                        <div style={{ marginLeft: 12 }}>
                            <div style={{ fontWeight: 500, fontSize: "14px" }}>
                                {name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                                {userData.email}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Job & Company",
            key: "job",
            align: "left",
            width: 280,
            render: (_, record) => {
                const job = record.job || {};
                const company = job.company || {};
                const companyData = company.data || company;

                return (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            size={40}
                            src={companyData.imageUrl}
                            style={{
                                objectFit: "contain",
                                borderRadius: "6px",
                            }}
                            icon={<BankOutlined />}
                        />
                        <div style={{ marginLeft: 12 }}>
                            <div style={{ fontWeight: 500, fontSize: "14px" }}>
                                {job.title || "Unknown Job"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                                {companyData.name || "Unknown Company"}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Contact",
            key: "contact",
            align: "left",
            width: 150,
            render: (_, record) => {
                const user = record.user || {};
                const userData = user.data || user;
                return (
                    <div>
                        {userData.phone1 && (
                            <div style={{ marginBottom: 4 }}>
                                <PhoneOutlined
                                    style={{ marginRight: 4, color: "#52c41a" }}
                                />
                                <span style={{ fontSize: "12px" }}>
                                    {userData.phone1}
                                </span>
                            </div>
                        )}
                        {userData.email && (
                            <div>
                                <MailOutlined
                                    style={{ marginRight: 4, color: "#1890ff" }}
                                />
                                <span style={{ fontSize: "12px" }}>
                                    {userData.email.length > 20
                                        ? userData.email.substring(0, 20) +
                                          "..."
                                        : userData.email}
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Job Type",
            key: "jobType",
            align: "center",
            width: 120,
            render: (_, record) => {
                const job = record.job || {};
                const jobType =
                    job.type === 0
                        ? "Internship"
                        : job.type === 1
                        ? "Contract"
                        : job.type === 2
                        ? "Part-time"
                        : job.type === 3
                        ? "Full-time"
                        : "Other";

                const color =
                    job.type === 0
                        ? "orange"
                        : job.type === 1
                        ? "purple"
                        : job.type === 2
                        ? "blue"
                        : job.type === 3
                        ? "green"
                        : "default";

                return <Tag color={color}>{jobType}</Tag>;
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
                            : "Fresher"}
                    </Space>
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
                const user = record.user || {};
                const userData = user.data || user;
                const resumeUrl = userData.resume?.resumeUrl;

                if (resumeUrl) {
                    return (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => window.open(resumeUrl, "_blank")}
                        >
                            View
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
                            <Button size="small">
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

export default getGlobalJobApplicationsColumns;
