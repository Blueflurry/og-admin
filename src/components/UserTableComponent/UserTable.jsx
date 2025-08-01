// Fixed UserTable.jsx - Ensure handle functions are properly passed to columns
import React from "react";
import { Table } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import getUserTableColumns from "./UserTableColumns";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./UserTableConfig";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const UserTable = ({
    userData,
    pagination,
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    ...props
}) => {
    const { styles } = useStyle();
    const { selectionType, handleChange, clearFilters } = useTableConfig();

    const handleTableChange = (pagination, filters, sorter) => {
        const { handleChange: originalHandleChange } = handleChange(
            pagination,
            filters,
            sorter
        );

        // Handle sorting
        let sort = "";
        if (sorter.order) {
            const sortDirection = sorter.order === "ascend" ? "" : "-";
            sort = `${sortDirection}${sorter.field}`;
        } else {
            sort = "-createdAt"; // Default sort
        }

        // Update pagination and sort
        setUpdateRecords({
            page: pagination.current,
            limit: pagination.pageSize,
            sort,
        });
    };

    // Create column handlers with explicit parameters
    const onView = (record) => {
        if (handleView) handleView(record);
    };

    const onEdit = (record) => {
        if (handleEdit) handleEdit(record);
    };

    const onDelete = (record) => {
        if (handleDelete) {
            handleDelete(record);
        } else {
            console.error("handleDelete is not provided to UserTable");
        }
    };

    const columns = getUserTableColumns({
        handleView: onView,
        handleEdit: onEdit,
        handleDelete: onDelete,
    });

    const dataSource = userData.map((user) => ({
        ...user,
        key: user.id || user._id,
    }));

    return (
        <Table
            className={styles.customTable}
            size="middle"
            scroll={{ x: "max-content" }}
            columns={columns}
            dataSource={dataSource}
            onChange={handleTableChange}
            tableLayout="fixed"
            pagination={getPaginationConfig({
                pagination,
                onChangePagination: (page, pageSize) => {
                    setUpdateRecords({
                        page,
                        limit: pageSize,
                    });
                },
            })}
        />
    );
};

export default UserTable;
