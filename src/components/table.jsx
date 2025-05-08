import { Avatar, Button, Space, Table, Tag, Dropdown } from "antd";
import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import moment from "moment";
import { createStyles } from "antd-style";

const useStyle = createStyles(({ css, token }) => {
    const { antCls } = token;
    return {
        customTable: css`
            ${antCls}-table {
                ${antCls}-table-container {
                    ${antCls}-table-body,
                    ${antCls}-table-content {
                        scrollbar-width: thin;
                        scrollbar-color: #eaeaea transparent;
                        scrollbar-gutter: stable;
                    }
                }
            }
        `,
        tableControls: css`
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        `,
        leftControls: css`
            display: flex;
            gap: 8px;
        `,
        rightControls: css`
            display: flex;
            gap: 8px;
        `,
    };
});

const TableComponent = ({
    userData,
    pagination,
    handleView,
    handleEdit,
    handleDelete,
    setUpdateRecords,
    ...props
}) => {
    // console.log("data", data);
    const { styles } = useStyle();
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [selectionType, setSelectionType] = useState("checkbox");

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(
                `selectedRowKeys: ${selectedRowKeys}`,
                "selectedRows: ",
                selectedRows
            );
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === "Disabled User", // Column configuration not to be checked
            name: record.name,
        }),
    };

    const onChangePagination = (page, pageSize) => {
        // console.log("Page: ", page, "Page Size: ", pageSize);
        setUpdateRecords({ page: page, limit: pageSize });
    };

    const handleChange = (pagination, filters, sorter) => {
        console.log("Various parameters", pagination, filters, sorter);
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };
    const clearFilters = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };
    const clearAll = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };
    const setAgeSort = () => {
        setSortedInfo({
            order: "descend",
            columnKey: "age",
        });
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Profile",
            dataIndex: "imageUrl",
            key: "avatar",
            width: 80,
            render: (imageUrl) => (
                <Avatar
                    src={
                        imageUrl ||
                        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                    }
                />
            ),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            // sorter: (a, b) => {
            //     const nameA = `${a.name.first} ${a.name.last}`.toLowerCase();
            //     const nameB = `${b.name.first} ${b.name.last}`.toLowerCase();
            //     return nameA.localeCompare(nameB);
            // },
            render: (name) => `${name.first} ${name.last}`,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email) => <a href={`mailto:${email}`}>{email}</a>,
        },
        {
            title: "Primary Phone",
            dataIndex: "phone1",
            key: "phone",
            render: (phone) => `+91-${phone}`,
        },
        {
            title: "Date of Birth",
            dataIndex: "dob",
            key: "dob",
            // sorter: (a, b) => moment(a.dob).valueOf() - moment(b.dob).valueOf(),
            render: (dob) => moment(dob).format("DD MMM, YYYY"),
        },
        {
            title: "Street Address",
            dataIndex: "address",
            key: "address",
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
            // filters: [
            //     { text: "Active", value: 1 },
            //     { text: "Inactive", value: 0 },
            // ],
            // onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={status === 1 ? "green" : "red"}>
                    {status === 1 ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === 1 ? "green" : "red"}>
                    {status === 1 ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === 1 ? "green" : "red"}>
                    {status === 1 ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
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

    const dataSource = userData.map((user) => ({
        ...user,
        key: user.id || user._id,
    }));

    return (
        <>
            {/* <Space style={{ marginBottom: 16 }}>
                <Button onClick={setAgeSort}>Sort age</Button>
                <Button onClick={clearFilters}>Clear filters</Button>
            </Space> */}
            {/* <Button onClick={clearAll}>Clear filters and sorters</Button> */}

            <div className={styles.tableControls}>
                <div className={styles.leftControls}>
                    {/* <Button onClick={setAgeSort}>Sort age</Button>
                    <Button onClick={clearFilters}>Clear filters</Button> */}
                </div>
                <div className={styles.rightControls}>
                    <Button onClick={setAgeSort}>
                        <SearchOutlined />
                        Search and Filter
                    </Button>
                    <Button type="primary" onClick={clearFilters}>
                        <PlusOutlined />
                        Create New
                    </Button>
                </div>
            </div>

            <Table
                className={styles.customTable}
                size="middle"
                scroll={{ x: "max-content" }}
                rowSelection={Object.assign(
                    { type: selectionType },
                    rowSelection
                )}
                columns={columns}
                dataSource={dataSource}
                onChange={handleChange}
                pagination={{
                    position: ["bottomRight"],
                    showQuickJumper: true,
                    showSizeChanger: true,
                    defaultCurrent: 1,
                    defaultPageSize: 10,
                    total: pagination.totalDocs,
                    size: "default",
                    onChange: onChangePagination,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
            />
        </>
    );
};
export default TableComponent;
