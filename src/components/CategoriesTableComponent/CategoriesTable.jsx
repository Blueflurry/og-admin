// src/components/CategoriesTableComponent/CategoriesTable.jsx
import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import CategoriesTableToolbar from "./CategoriesTableToolbar";
import getCategoriesTableColumns from "./CategoriesTableColumns";
import CategoriesFormDrawer from "./CategoriesFormDrawer";
import CategoriesViewDrawer from "./CategoriesViewDrawer";
import CategoriesSearchFilterDrawer from "./CategoriesSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./CategoriesTableConfig";
import { useAPI } from "../../hooks/useAPI";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const CategoriesTable = ({
    categoryData = [],
    pagination = {},
    setUpdateRecords,
    handleDelete,
    ...props
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const { selectionType, handleChange, clearFilters } = useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingCategory, setViewingCategory] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // State for bulk operations
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Filter configuration
    const filterConfig = {
        title: { type: "text", label: "Title" },
        description: { type: "text", label: "Description" },
        link: { type: "text", label: "Link" },
    };

    // Sort options
    const sortOptions = [
        { label: "Newest First", value: "-createdAt" },
        { label: "Oldest First", value: "createdAt" },
    ];

    const openDrawerForCreate = () => {
        setEditingCategory(null);
        setFormDrawerOpen(true);
    };

    const openSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(true);
    };

    const closeSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(false);
    };

    // Helper function to remove empty filters
    const cleanEmptyFilters = (filters) => {
        const cleanedFilters = {};

        Object.entries(filters).forEach(([key, value]) => {
            // Skip if value is null, undefined, or empty string
            if (value === null || value === undefined || value === "") {
                return;
            }

            // Skip if value is an empty array
            if (Array.isArray(value) && value.length === 0) {
                return;
            }

            // Skip if value is an empty object
            if (
                typeof value === "object" &&
                !Array.isArray(value) &&
                Object.keys(value).length === 0
            ) {
                return;
            }

            // For objects (like MongoDB operators), check if they have meaningful values
            if (typeof value === "object" && !Array.isArray(value)) {
                const cleanedObject = {};
                let hasValidValues = false;

                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (
                        subValue !== null &&
                        subValue !== undefined &&
                        subValue !== ""
                    ) {
                        if (Array.isArray(subValue) && subValue.length > 0) {
                            cleanedObject[subKey] = subValue;
                            hasValidValues = true;
                        } else if (!Array.isArray(subValue)) {
                            cleanedObject[subKey] = subValue;
                            hasValidValues = true;
                        }
                    }
                });

                if (hasValidValues) {
                    cleanedFilters[key] = cleanedObject;
                }
            } else {
                // Add non-empty primitive values and non-empty arrays
                cleanedFilters[key] = value;
            }
        });

        return cleanedFilters;
    };

    const handleApplyFilters = (filters) => {
        // Extract sort value if present
        const sortValue = filters.sort || "";
        delete filters.sort;

        // Clean empty filters
        const cleanedFilters = cleanEmptyFilters(filters);

        // Save applied filters for future reference
        setActiveFilters(cleanedFilters);

        // Update records with new filters and trigger data fetch
        if (setUpdateRecords) {
            setUpdateRecords({
                page: 1, // Reset to first page when filters change
                limit: pagination.limit || 10,
                sort: sortValue,
                filters: cleanedFilters,
            });
        }

        // Show success message only if filters were applied
        const filterCount = Object.keys(cleanedFilters).length;
        if (filterCount > 0) {
            message.success(`${filterCount} filter(s) applied successfully`);
        } else {
            message.info("All filters cleared");
        }
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
        setViewingCategory(record);
        setViewDrawerOpen(true);
    };

    const localHandleEdit = (record) => {
        setEditingCategory(record);
        setFormDrawerOpen(true);
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingCategory(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingCategory(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const handleBulkDownload = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select categories to download");
            return;
        }

        // TODO: Implement bulk download functionality
        message.info(`Downloading ${selectedRowKeys.length} categories...`);
    };

    const columns = getCategoriesTableColumns({
        handleView: localHandleView,
        handleEdit: localHandleEdit,
        handleDelete,
    });

    const dataSource = Array.isArray(categoryData)
        ? categoryData.map((category) => ({
              ...category,
              key: category.id || category._id,
          }))
        : [];

    return (
        <>
            <CategoriesTableToolbar
                onCreateNew={openDrawerForCreate}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
                selectedCount={selectedRowKeys.length}
                onBulkDownload={handleBulkDownload}
            />

            <Table
                className={styles.customTable}
                size="middle"
                scroll={{ x: "max-content" }}
                columns={columns}
                dataSource={dataSource}
                onChange={handleChange}
                pagination={getPaginationConfig({
                    pagination,
                    onChangePagination,
                })}
            />

            {/* Form drawer for create/edit */}
            <CategoriesFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingCategory}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <CategoriesViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                categoryData={viewingCategory}
            />

            {/* Search and filter drawer */}
            <CategoriesSearchFilterDrawer
                open={searchFilterDrawerOpen}
                onClose={closeSearchFilterDrawer}
                filterConfig={filterConfig}
                sortOptions={sortOptions}
                onApplyFilters={handleApplyFilters}
                initialValues={{ ...activeFilters, sort: pagination.sort }}
            />
        </>
    );
};

export default CategoriesTable;
