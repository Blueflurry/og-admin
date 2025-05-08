import React from "react";
import { Space, Tag, Button, Dropdown } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
} from "@ant-design/icons";

const getJobTableColumns = ({ handleView, handleEdit, handleDelete }) => [
    {
        title: "Title",
        dataIndex: "title",
        key: "title",
        align: "left",
    },
    {
        title: "Company",
        dataIndex: "company",
        key: "company",
        align: "left",
        render: (company) => company?.name || "N/A",
    },
    {
        title: "Location",
        dataIndex: "location",
        key: "location",
        align: "center",
    },
    {
        title: "Job Type",
        dataIndex: "jobType",
        key: "jobType",
        align: "center",
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
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
