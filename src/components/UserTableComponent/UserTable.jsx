import React, { useState } from "react";
import { Table } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import UserTableToolbar from "./UserTableToolbar";
import getUserTableColumns from "./UserTableColumns";
import UserFormDrawer from "./UserFormDrawer";
import UserViewDrawer from "./UserViewDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./UserTableConfig";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const UserTable = ({
    userData,
    pagination,
    handleDelete,
    setUpdateRecords,
    ...props
}) => {
    const { styles } = useStyle();
    const {
        selectionType,
        rowSelection,
        handleChange,
        setAgeSort,
        clearFilters,
    } = useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);

    const openDrawerForCreate = () => {
        setEditingUser(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        setFormDrawerOpen(true);
    };

    const handleView = (record) => {
        setViewingUser(record);
        setViewDrawerOpen(true);
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingUser(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingUser(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords({ page: 1, limit: 10, sort: "" });
        }
    };

    const onChangePagination = (page, pageSize) => {
        // Update records with new page and limit values
        if (setUpdateRecords) {
            setUpdateRecords({
                page: page,
                limit: pageSize,
                sort: "",
            });
        }
    };

    const columns = getUserTableColumns({
        handleView,
        handleEdit,
        handleDelete,
    });

    const dataSource = userData.map((user) => ({
        ...user,
        key: user.id || user._id,
    }));

    return (
        <>
            <UserTableToolbar
                onSearch={setAgeSort}
                onCreateNew={openDrawerForCreate}
            />

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
                pagination={getPaginationConfig({
                    pagination,
                    onChangePagination,
                })}
            />

            {/* Form drawer for create/edit */}
            <UserFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingUser}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <UserViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                userData={viewingUser}
            />
        </>
    );
};

export default UserTable;
