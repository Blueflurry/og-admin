import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import ManageCompaniesTableToolbar from "./ManageCompaniesTableToolbar";
import getManageCompaniesTableColumns from "./ManageCompaniesTableColumns";
import ManageCompaniesFormDrawer from "./ManageCompaniesFormDrawer";
import ManageCompaniesViewDrawer from "./ManageCompaniesViewDrawer";
import ManageCompaniesSearchFilterDrawer from "./ManageCompaniesSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ManageCompaniesTableConfig";
import { useAPI } from "../../hooks/useAPI";
import { useUserPermission } from "../../hooks/useUserPermission";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const ManageCompaniesTable = ({
    companyData = [],
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
    const [editingCompany, setEditingCompany] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingCompany, setViewingCompany] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    const openDrawerForCreate = () => {
        setEditingCompany(null);
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
            setViewingCompany(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingCompany(record);
            setFormDrawerOpen(true);
        }
    };

    const localHandleDelete = async (record) => {
        if (handleDelete) {
            handleDelete(record);
        } else {
            try {
                await api.deleteManageCompany(record.id || record._id);
                message.success("Company deleted successfully");
                // Refresh the table data
                if (setUpdateRecords) {
                    setUpdateRecords((prev) => ({ ...prev }));
                }
            } catch (error) {
                console.error("Error deleting company:", error);
                message.error("Failed to delete company");
            }
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingCompany(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingCompany(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const columns = getManageCompaniesTableColumns({
        handleView: can("companies", "view") ? localHandleView : null,
        handleEdit: can("companies", "edit") ? localHandleEdit : null,
        handleDelete: can("companies", "delete") ? localHandleDelete : null,
    });

    const dataSource = Array.isArray(companyData)
        ? companyData.map((company) => ({
              ...company,
              key: company.id || company._id,
          }))
        : [];

    return (
        <>
            <ManageCompaniesTableToolbar
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
            <ManageCompaniesFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingCompany}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <ManageCompaniesViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                companyData={viewingCompany}
            />

            {/* Search and filter drawer */}
            <ManageCompaniesSearchFilterDrawer
                open={searchFilterDrawerOpen}
                onClose={closeSearchFilterDrawer}
                onApplyFilters={handleApplyFilters}
                initialValues={{ ...activeFilters, sort: pagination.sort }}
            />
        </>
    );
};

export default ManageCompaniesTable;
