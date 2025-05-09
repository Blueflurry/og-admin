import React from "react";
import { Space, Tag, Button, Dropdown, Avatar } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    EnvironmentOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import moment from "moment";

const getJobTableColumns = ({ handleView, handleEdit, handleDelete }) => [
    {
        title: "Job Title",
        key: "jobInfo",
        align: "left",
        width: 250,
        render: (_, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={50}
                    src={record.company?.data?.imageUrl || ""}
                    style={{
                        // backgroundColor: "#f56a00",
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
        width: 150,
        render: (location) => (
            <Space>
                <EnvironmentOutlined />
                {location?.city || ""}
                {location?.city && location?.state ? ", " : ""}
                {location?.state || ""}
            </Space>
        ),
    },
    {
        title: "Remote",
        dataIndex: "isRemote",
        key: "isRemote",
        align: "center",
        width: 100,
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
        title: "Experience",
        key: "experience",
        align: "center",
        width: 100,
        render: (_, record) => (
            <span>
                {record.minExperience}{" "}
                {record.minExperience === 1 ? "year" : "years"}+
            </span>
        ),
    },
    {
        title: "Salary Range",
        dataIndex: "salaryRange",
        key: "salary",
        align: "center",
        width: 150,
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
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        fixed: "right",
        width: 100,
        render: (status) => (
            <Tag color={status === 1 ? "green" : "red"}>
                {status === 1 ? "Active" : "Inactive"}
            </Tag>
        ),
    },
    {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 100,
        align: "center",
        render: (_, record) => (
            <Space size="middle">
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: "View",
                                label: "View",
                                icon: <EyeOutlined />,
                                onClick: () => handleView && handleView(record),
                            },
                            {
                                key: "Edit",
                                label: "Edit",
                                icon: <EditOutlined />,
                                onClick: () => handleEdit && handleEdit(record),
                            },
                            {
                                key: "Delete",
                                label: "Delete",
                                icon: <DeleteOutlined />,
                                onClick: () =>
                                    handleDelete && handleDelete(record),
                            },
                        ],
                    }}
                >
                    <Button color="primary" variant="outlined">
                        Actions <DownOutlined />
                    </Button>
                </Dropdown>
            </Space>
        ),
    },
];

export default getJobTableColumns;
