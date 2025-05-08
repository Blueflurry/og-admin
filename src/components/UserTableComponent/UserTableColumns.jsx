import React from "react";
import { Space, Avatar, Tag, Button, Dropdown } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import moment from "moment";

const getUserTableColumns = ({ handleView, handleEdit, handleDelete }) => [
    {
        title: "User Information",
        key: "userInfo",
        align: "left",
        width: 320,
        render: (_, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={40}
                    src={
                        record.imageUrl ||
                        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                    }
                />
                <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                        {`${record.name.first || ""} ${record.name.last || ""}`}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        ID: {record.id || record._id}
                    </div>
                </div>
            </div>
        ),
    },
    // {
    //     title: "ID",
    //     dataIndex: "id",
    //     key: "id",
    //     align: "center",
    // },
    // {
    //     title: "Profile",
    //     dataIndex: "imageUrl",
    //     key: "avatar",
    //     width: 80,
    //     align: "center",
    //     render: (imageUrl) => (
    //         <Avatar
    //             src={
    //                 imageUrl ||
    //                 "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
    //             }
    //         />
    //     ),
    // },
    // {
    //     title: "Name",
    //     dataIndex: "name",
    //     key: "name",
    //     align: "center",
    //     render: (name) => `${name.first} ${name.last}`,
    // },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        align: "left",
        render: (email) => <a href={`mailto:${email}`}>{email}</a>,
    },
    {
        title: "Primary Phone",
        dataIndex: "phone1",
        key: "phone",
        align: "center",
        render: (phone) => `+91-${phone}`,
    },
    {
        title: "Date of Birth",
        dataIndex: "dob",
        key: "dob",
        align: "center",
        render: (dob) => moment(dob).format("DD MMM, YYYY"),
    },
    {
        title: "Street Address",
        dataIndex: "address",
        key: "address",
        align: "center",
        render: (address) => (
            <span>
                {address.street}, {address.pincode}
            </span>
        ),
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
                                onClick: () => handleView(record),
                            },
                            {
                                key: "Edit",
                                label: "Edit",
                                icon: <EditOutlined />,
                                onClick: () => handleEdit(record),
                            },
                            {
                                key: "Delete",
                                label: "Delete",
                                icon: <DeleteOutlined />,
                                onClick: () => handleDelete(record),
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

export default getUserTableColumns;
