import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import CarouselsTableToolbar from "./CarouselsTableToolbar";
import getCarouselsTableColumns from "./CarouselsTableColumns";
import CarouselsFormDrawer from "./CarouselsFormDrawer";
import CarouselsViewDrawer from "./CarouselsViewDrawer";
import CarouselsSearchFilterDrawer from "./CarouselsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./CarouselsTableConfig";
import { useAPI } from "../../hooks/useAPI";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const CarouselsTable = ({
    carouselData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    ...props
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const { selectionType, rowSelection, handleChange, clearFilters } =
        useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingCarousel, setEditingCarousel] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingCarousel, setViewingCarousel] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // Updated filter configuration to match actual API data
    const filterConfig = {
        title: { type: "text", label: "Title" },
        description: { type: "text", label: "Description" },
        link: { type: "text", label: "Link" },
    };

    // Updated sort options
    const sortOptions = [
        { label: "Newest First", value: "-createdAt" },
        { label: "Oldest First", value: "createdAt" },
    ];

    const openDrawerForCreate = () => {
        setEditingCarousel(null);
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
        if (handleView) {
            handleView(record);
        } else {
            setViewingCarousel(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingCarousel(record);
            setFormDrawerOpen(true);
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingCarousel(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingCarousel(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const columns = getCarouselsTableColumns({
        handleView: localHandleView,
        handleEdit: localHandleEdit,
        handleDelete,
    });

    const dataSource = Array.isArray(carouselData)
        ? carouselData.map((carousel) => ({
              ...carousel,
              key: carousel.id || carousel._id,
          }))
        : [];

    return (
        <>
            <CarouselsTableToolbar
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
            <CarouselsFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingCarousel}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <CarouselsViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                carouselData={viewingCarousel}
            />

            {/* Search and filter drawer */}
            <CarouselsSearchFilterDrawer
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

export default CarouselsTable;
