import React, { useState, useEffect } from "react";
import { Table, message, Modal } from "antd";
import { createStyles } from "antd-style";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// Import separated components and utilities
import ManageOptinsTableToolbar from "./ManageOptinsTableToolbar";
import getManageOptinsTableColumns from "./ManageOptinsTableColumns";
import ManageOptinsFormDrawer from "./ManageOptinsFormDrawer";
import ManageOptinsViewDrawer from "./ManageOptinsViewDrawer";
import ManageOptinsSearchFilterDrawer from "./ManageOptinsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ManageOptinsTableConfig";
import { useAPI } from "../../hooks/useAPI";
import { useUserPermission } from "../../hooks/useUserPermission";

// const { confirm } = Modal;
const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const ManageOptinsTable = ({
    optinData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    ...props
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const { can } = useUserPermission();
    const { selectionType, rowSelection, handleChange, clearFilters } =
        useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingOptin, setEditingOptin] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingOptin, setViewingOptin] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    const openDrawerForCreate = () => {
        setEditingOptin(null);
        setFormDrawerOpen(true);
    };

    const openSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(true);
    };

    const closeSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(false);
    };

    const handleApplyFilters = (filters) => {
        // Extract sort value if present
        const sortValue = filters.sort || "";
        delete filters.sort;

        // Save applied filters for future reference
        setActiveFilters(filters);

        // Update records with new filters and trigger data fetch
        if (setUpdateRecords) {
            setUpdateRecords({
                page: 1, // Reset to first page when filters change
                limit: pagination.limit || 10,
                sort: sortValue,
                filters: filters,
            });
        }

        message.success("Filters applied successfully");
    };

    const onChangePagination = (page, pageSize) => {
        // Update records with new page and limit values while preserving filters
        if (setUpdateRecords) {
            setUpdateRecords({
                page: page,
                limit: pageSize,
                sort: pagination.sort || "",
                filters: activeFilters,
            });
        }
    };

    const localHandleView = (record) => {
        if (handleView) {
            handleView(record);
        } else {
            setViewingOptin(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingOptin(record);
            setFormDrawerOpen(true);
        }
    };

    const localHandleDelete = async (record) => {
        if (handleDelete) {
            handleDelete(record);
        } else {
            // confirm({
            //     title: "Are you sure you want to delete this optin?",
            //     icon: <ExclamationCircleOutlined />,
            //     content: "This action cannot be undone.",
            //     okText: "Yes",
            //     okType: "danger",
            //     cancelText: "No",
            //     onOk: async () => {
            try {
                await api.deleteManageOptin(record.id || record._id);
                message.success("Optin deleted successfully");

                // Refresh data
                if (setUpdateRecords) {
                    setUpdateRecords((prev) => ({ ...prev }));
                }
            } catch (error) {
                console.error("Error deleting optin:", error);
                message.error("Failed to delete optin");
            }
            //     },
            // });
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingOptin(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingOptin(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const columns = getManageOptinsTableColumns({
        handleView: can("optins", "view") ? localHandleView : null,
        handleEdit: can("optins", "edit") ? localHandleEdit : null,
        handleDelete: can("optins", "delete") ? localHandleDelete : null,
    });

    const dataSource = Array.isArray(optinData)
        ? optinData.map((optin) => ({
              ...optin,
              key: optin.id || optin._id,
          }))
        : [];

    return (
        <>
            <ManageOptinsTableToolbar
                onCreateNew={openDrawerForCreate}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table
                className={styles.customTable}
                size="middle"
                scroll={{ x: "max-content" }}
                rowSelection={
                    rowSelection
                        ? {
                              type: selectionType,
                              ...rowSelection,
                          }
                        : null
                }
                columns={columns}
                dataSource={dataSource}
                onChange={handleChange}
                pagination={getPaginationConfig({
                    pagination,
                    onChangePagination,
                })}
            />

            {/* Form drawer for create/edit */}
            <ManageOptinsFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingOptin}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <ManageOptinsViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                optinData={viewingOptin}
            />

            {/* Search and filter drawer */}
            <ManageOptinsSearchFilterDrawer
                open={searchFilterDrawerOpen}
                onClose={closeSearchFilterDrawer}
                onApplyFilters={handleApplyFilters}
                initialValues={{ ...activeFilters, sort: pagination.sort }}
            />
        </>
    );
};

export default ManageOptinsTable;
