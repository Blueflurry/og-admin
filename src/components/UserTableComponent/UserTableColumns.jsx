// Updated UserTableColumns.jsx with complete address details
import React from "react";
import { Space, Avatar, Tag, Button, Dropdown, Tooltip } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
// import PermissionGate from "../../components/PermissionGate";
// Permission is injected from parent to avoid hooks inside render paths

const getUserTableColumns = ({ handleView, handleEdit, handleDelete, can }) => {
    return [
        {
            title: "User Information",
            key: "userInfo",
            align: "left",
            width: 320,
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        size={50}
                        src={
                            record.imageUrl ||
                            record.imgUrl ||
                            record.img ||
                            `https://ui-avatars.com/api/?name=${
                                record.name?.first + "+" + record.name?.last
                            }&background=f5f5f5&color=757575&size=400`
                        }
                        style={{
                            objectFit: "contain",
                            borderRadius: "50%",
                        }}
                    />
                    <div style={{ marginLeft: 12 }}>
                        <div style={{ fontWeight: 500 }}>
                            {record.name?.first || ""}
                            {record.name?.middle
                                ? ` ${record.name.middle} `
                                : " "}
                            {record.name?.last || ""}
                        </div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            ID: {record.id || record._id}
                        </div>
                    </div>
                </div>
            ),
        },

        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 140,
            render: (status) => {
                let color, text;

                switch (status) {
                    case "1":
                    case 1:
                        color = "green";
                        text = "Active";
                        break;
                    case "0":
                    case 0:
                        color = "gold";
                        text = "Unauthorized";
                        break;
                    case "-1":
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
            title: "Email",
            dataIndex: "email",
            key: "email",
            align: "left",
            width: 250,
            render: (email) =>
                email ? <a href={`mailto:${email}`}>{email}</a> : "N/A",
        },
        {
            title: "User Role",
            dataIndex: "role",
            key: "role",
            align: "center",
            width: 100,
            // sorter: true,
            render: (userRole) =>
                userRole === "user" ? `free user` : "alumni",
        },
        {
            title: "Primary Phone",
            dataIndex: "phone1",
            key: "phone",
            align: "center",
            width: 150,
            render: (phone) => (phone ? `+91-${phone}` : "N/A"),
        },
        {
            title: "Education",
            dataIndex: "education",
            key: "education",
            align: "left",
            width: 250,
            ellipsis: true,
            render: (education) => {
                if (
                    !education ||
                    !Array.isArray(education) ||
                    education.length === 0
                ) {
                    return "N/A";
                }

                // Get the latest education based on startYear
                const latestEducation = education.reduce((latest, current) => {
                    const latestDate = latest.startYear
                        ? new Date(latest.startYear)
                        : new Date(0);
                    const currentDate = current.startYear
                        ? new Date(current.startYear)
                        : new Date(0);
                    return currentDate > latestDate ? current : latest;
                }, education[0]);

                const educationInfo = `${latestEducation.name || "N/A"} - ${
                    latestEducation.institution || "N/A"
                }`;

                return (
                    <Tooltip title={educationInfo}>
                        <div
                            style={{
                                maxWidth: "230px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <div style={{ fontWeight: 500, fontSize: "13px" }}>
                                {latestEducation.name || "N/A"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                                {latestEducation.institution || "N/A"}
                            </div>
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: "Experience",
            dataIndex: "experience",
            key: "experience",
            align: "left",
            width: 250,
            ellipsis: true,
            render: (experience) => {
                if (
                    !experience ||
                    !Array.isArray(experience) ||
                    experience.length === 0
                ) {
                    return "N/A";
                }

                // Get the latest experience based on startYear
                const latestExperience = experience.reduce(
                    (latest, current) => {
                        const latestDate = latest.startYear
                            ? new Date(latest.startYear)
                            : new Date(0);
                        const currentDate = current.startYear
                            ? new Date(current.startYear)
                            : new Date(0);
                        return currentDate > latestDate ? current : latest;
                    },
                    experience[0]
                );

                const experienceInfo = `${latestExperience.title || "N/A"} - ${
                    latestExperience.companyName || "N/A"
                }`;

                return (
                    <Tooltip title={experienceInfo}>
                        <div
                            style={{
                                maxWidth: "230px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <div style={{ fontWeight: 500, fontSize: "13px" }}>
                                {latestExperience.title || "N/A"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                                {latestExperience.companyName || "N/A"}
                            </div>
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            width: 150,
            // sorter: true,
            render: (createdAt) =>
                createdAt ? dayjs(createdAt).format("DD MMM, YYYY") : "N/A",
        },

        {
            title: "Date of Birth",
            dataIndex: "dob",
            key: "dob",
            align: "center",
            width: 120,
            render: (dob) => (dob ? dayjs(dob).format("DD MMM, YYYY") : "N/A"),
        },
        {
            title: "Location",
            dataIndex: "address",
            key: "address",
            align: "left",
            width: 200,
            ellipsis: true,
            render: (address) => {
                if (!address) return "N/A";

                // Filter out empty values, "undefined" strings, and collect available fields
                const addressParts = [
                    address.street,
                    address.city,
                    address.state,
                    address.pincode,
                    address.country,
                ].filter((part) => {
                    if (!part || part.trim() === "") return false;
                    // Filter out "undefined" as a string value
                    if (
                        part.trim().toLowerCase() === "undefined" ||
                        part.trim() === "undefined, India"
                    )
                        return false;
                    return true;
                });

                // If only country is present and it's "India", show N/A
                if (
                    addressParts.length === 1 &&
                    address.country?.trim() === "India"
                ) {
                    return "N/A";
                }

                // If no valid parts, return N/A
                if (addressParts.length === 0) {
                    return "N/A";
                }

                const fullAddress = addressParts.join(", ");

                return (
                    <Tooltip title={fullAddress}>
                        <Space align="start">
                            <EnvironmentOutlined style={{ marginTop: "4px" }} />
                            <span
                                style={{
                                    maxWidth: "160px",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    textWrap: "auto",
                                    wordBreak: "break-word",
                                    lineHeight: "1.4",
                                }}
                            >
                                {fullAddress}
                            </span>
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 120,
            align: "center",
            render: (_, record) => {
                const items = [];

                // Create menu items array for dropdown
                // const items = [
                if (can("users", "view")) {
                    items.push({
                        key: "view",
                        label: "View",
                        icon: <EyeOutlined />,
                        onClick: () => {
                            if (handleView) handleView(record);
                        },
                    });
                }

                if (can("users", "edit")) {
                    items.push({
                        key: "edit",
                        label: "Edit",
                        icon: <EditOutlined />,
                        onClick: () => {
                            if (handleEdit) handleEdit(record);
                        },
                    });
                }
                // ];

                // Only add delete option if handleDelete is provided
                if (handleDelete && can("users", "delete")) {
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
                if (items?.length === 0) {
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

export default getUserTableColumns;
