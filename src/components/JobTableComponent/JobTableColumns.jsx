// Updated JobTableColumns.jsx - Fix for the hook error
import React from "react";
import { Space, Tag, Button, Dropdown, Avatar } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserPermission } from "../../hooks/useUserPermission";

// Move the navigate function to be passed as a prop instead of using the hook inside render
const getJobTableColumns = ({
    handleView,
    handleEdit,
    handleDelete,
    onViewApplications,
}) => [
    {
        title: "Job Title",
        key: "jobInfo",
        align: "left",
        render: (_, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={50}
                    src={record.company?.data?.imageUrl}
                    style={{
                        objectFit: "contain",
                        borderRadius: "50%",
                    }}
                >
                    {record.company?.data?.name?.charAt(0) || "J"}
                </Avatar>
                <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                        {record.title || "Untitled Job"}
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
        width: 120,
        render: (status) => (
            <Tag color={status === 0 ? "green" : "red"}>
                {status === 0 ? "Active" : "Inactive"}
            </Tag>
        ),
    },
    {
        title: "Experience",
        key: "experience",
        align: "left",
        width: 100,
        render: (_, record) => (
            <span>
                {record.minExperience}
                {record.minExperience === 1 ? " yr" : ""}
                {record.maxExperience > 0
                    ? " - " + record.maxExperience + " yrs"
                    : " yrs"}{" "}
            </span>
        ),
    },
    {
        title: "Salary Range",
        dataIndex: "salaryRange",
        key: "salary",
        align: "center",
        width: 120,
    },
    {
        title: "Posted Date",
        dataIndex: "createdAt",
        key: "createdDate",
        align: "center",
        width: 120,
        render: (date) => moment(date).format("DD MMM, YYYY"),
    },
    {
        title: "Remote",
        dataIndex: "isRemote",
        key: "isRemote",
        align: "center",
        width: 150,
        render: (isRemote) =>
            isRemote ? (
                <Tag icon={<HomeOutlined />} color="purple">
                    Remote
                </Tag>
            ) : (
                <Tag icon={<EnvironmentOutlined />} color="orange">
                    On-Site
                </Tag>
            ),
    },
    {
        title: "Company",
        key: "company",
        dataIndex: "company",
        align: "left",
        width: 150,
        render: (company) => company?.data?.name || "N/A",
    },
    {
        title: "Location",
        dataIndex: "location",
        key: "location",
        align: "left",
        render: (location) => {
            let display = `${
                location?.street == "undefined" ? "" : location?.street
            } ${location?.city}`;
            if (location?.state && location?.state != "undefined")
                display += `, ${location?.state}`;
            return (
                <Space>
                    <EnvironmentOutlined />
                    {display}
                </Space>
            );
        },
    },
    // Add Applications column
    // {
    //     title: "Applications",
    //     key: "applications",
    //     align: "center",
    //     fixed: "right",
    //     width: 120,
    //     render: (_, record) => (
    //         <Button
    //             type="link"
    //             icon={<TeamOutlined />}
    //             onClick={() => {
    //                 // if (onViewApplications) {
    //                 onViewApplications(record.id || record._id);
    //                 // }
    //             }}
    //         >
    //             View Applications
    //         </Button>
    //     ),
    // },
    {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 100,
        align: "center",
        render: (_, record) => {
            const { can } = useUserPermission();
            const items = [];

            if (can("jobs", "view")) {
                items.push({
                    key: "view",
                    label: "View",
                    icon: <EyeOutlined />,
                    onClick: () => {
                        if (handleView) handleView(record);
                    },
                });
            }

            if (can("jobs", "edit")) {
                items.push({
                    key: "edit",
                    label: "Edit",
                    icon: <EditOutlined />,
                    onClick: () => {
                        if (handleEdit) handleEdit(record);
                    },
                });
            }

            if (handleDelete && can("jobs", "delete")) {
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

export default getJobTableColumns;
