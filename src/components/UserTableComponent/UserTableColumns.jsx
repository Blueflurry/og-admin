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
        width: 250,
        render: (_, record) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={50}
                    src={
                        record.imageUrl ||
                        record.imgUrl ||
                        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                    }
                    style={{
                        objectFit: "contain",
                        borderRadius: "50%",
                    }}
                />
                <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                        {record.name.first || ""}
                        {record.name.middle ? ` ${record.name.middle} ` : " "}
                        {record.name.last || ""}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        ID: {record.id || record._id}
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        align: "left",
        width: 220,
        render: (email) =>
            email ? <a href={`mailto:${email}`}>{email}</a> : "N/A",
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
        title: "Secondary Phone",
        dataIndex: "phone2",
        key: "phone2",
        align: "center",
        width: 150,
        render: (phone) => (phone ? `+91-${phone}` : "N/A"),
    },
    {
        title: "Date of Birth",
        dataIndex: "dob",
        key: "dob",
        align: "center",
        width: 120,
        render: (dob) => (dob ? moment(dob).format("DD MMM, YYYY") : "N/A"),
    },
    {
        title: "Location",
        dataIndex: "address",
        key: "address",
        align: "left",
        width: 200,
        render: (address) =>
            address ? (
                <span>
                    {address.city || ""}
                    {address.city && address.state ? ", " : ""}
                    {address.state || ""}
                    {(address.city || address.state) && address.country
                        ? ", "
                        : ""}
                    {address.country || ""}
                </span>
            ) : (
                "N/A"
            ),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
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

export default getUserTableColumns;
