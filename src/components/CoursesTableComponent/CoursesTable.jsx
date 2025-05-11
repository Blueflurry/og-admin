import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import CoursesTableToolbar from "./CoursesTableToolbar";
import getCoursesTableColumns from "./CoursesTableColumns";
import CoursesFormDrawer from "./CoursesFormDrawer";
import CoursesViewDrawer from "./CoursesViewDrawer";
import CoursesSearchFilterDrawer from "./CoursesSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./CoursesTableConfig";
import { useAPI } from "../../hooks/useAPI";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const CoursesTable = ({
    courseData = [],
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
    const [editingCourse, setEditingCourse] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingCourse, setViewingCourse] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // Hardcoded filter configuration since there's no config API
    const filterConfig = {
        title: { type: "text", label: "Title" },
        description: { type: "text", label: "Description" },
        startDate: { type: "date", label: "Start Date" },
        endDate: { type: "date", label: "End Date" },
        duration: { type: "number", label: "Duration (minutes)" },
        enrolled: { type: "number", label: "Enrolled Students" },
    };

    // Hardcoded sort options
    const sortOptions = [
        { label: "Newest First", value: "-createdAt" },
        { label: "Oldest First", value: "createdAt" },
    ];

    const openDrawerForCreate = () => {
        setEditingCourse(null);
        setFormDrawerOpen(true);
    };

    const openSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(true);
    };

    const closeSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(false);
    };

    const handleApplyFilters = (filters) => {
        console.log("Applying filters:", filters);

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
            setViewingCourse(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingCourse(record);
            setFormDrawerOpen(true);
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingCourse(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingCourse(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const columns = getCoursesTableColumns({
        handleView: localHandleView,
        handleEdit: localHandleEdit,
        handleDelete,
    });

    const dataSource = Array.isArray(courseData)
        ? courseData.map((course) => ({
              ...course,
              key: course.id || course._id,
          }))
        : [];

    return (
        <>
            <CoursesTableToolbar
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
            <CoursesFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingCourse}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <CoursesViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                courseData={viewingCourse}
            />

            {/* Search and filter drawer */}
            <CoursesSearchFilterDrawer
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

export default CoursesTable;
