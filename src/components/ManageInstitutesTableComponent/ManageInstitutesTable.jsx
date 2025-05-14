import React, { useState, useEffect } from "react";
import { Table, message, Modal } from "antd";
import { createStyles } from "antd-style";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// Import separated components and utilities
import ManageInstitutesTableToolbar from "./ManageInstitutesTableToolbar";
import getManageInstitutesTableColumns from "./ManageInstitutesTableColumns";
import ManageInstitutesFormDrawer from "./ManageInstitutesFormDrawer";
import ManageInstitutesViewDrawer from "./ManageInstitutesViewDrawer";
import ManageInstitutesSearchFilterDrawer from "./ManageInstitutesSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ManageInstitutesTableConfig";
import { useAPI } from "../../hooks/useAPI";
import { useUserPermission } from "../../hooks/useUserPermission";

// const { confirm } = Modal;
const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const ManageInstitutesTable = ({
    instituteData = [],
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
    const [editingInstitute, setEditingInstitute] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingInstitute, setViewingInstitute] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    const openDrawerForCreate = () => {
        setEditingInstitute(null);
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
            setViewingInstitute(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingInstitute(record);
            setFormDrawerOpen(true);
        }
    };

    const localHandleDelete = async (record) => {
        if (handleDelete) {
            handleDelete(record);
        } else {
            // confirm({
            //     title: "Are you sure you want to delete this institute?",
            //     icon: <ExclamationCircleOutlined />,
            //     content: "This action cannot be undone.",
            //     okText: "Yes",
            //     okType: "danger",
            //     cancelText: "No",
            //     onOk: async () => {
            try {
                await api.deleteInstitute(record.id || record._id);
                message.success("Institute deleted successfully");

                // Refresh data
                if (setUpdateRecords) {
                    setUpdateRecords((prev) => ({ ...prev }));
                }
            } catch (error) {
                console.error("Error deleting institute:", error);
                message.error("Failed to delete institute");
            }
            // },
            //     });
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingInstitute(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingInstitute(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const columns = getManageInstitutesTableColumns({
        handleView: can("institutes", "view") ? localHandleView : null,
        handleEdit: can("institutes", "edit") ? localHandleEdit : null,
        handleDelete: can("institutes", "delete") ? localHandleDelete : null,
    });

    const dataSource = Array.isArray(instituteData)
        ? instituteData.map((institute) => ({
              ...institute,
              key: institute.id || institute._id,
          }))
        : [];

    return (
        <>
            <ManageInstitutesTableToolbar
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
            <ManageInstitutesFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingInstitute}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <ManageInstitutesViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                instituteData={viewingInstitute}
            />

            {/* Search and filter drawer */}
            <ManageInstitutesSearchFilterDrawer
                open={searchFilterDrawerOpen}
                onClose={closeSearchFilterDrawer}
                onApplyFilters={handleApplyFilters}
                initialValues={{ ...activeFilters, sort: pagination.sort }}
            />
        </>
    );
};

export default ManageInstitutesTable;
