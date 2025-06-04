// Updated JobTable.jsx - Add navigation support
import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";
import { useNavigate } from "react-router-dom"; // Add this import

// Import separated components and utilities
import JobTableToolbar from "./JobTableToolbar";
import getJobTableColumns from "./JobTableColumns";
import JobFormDrawer from "./JobFormDrawer";
import JobViewDrawer from "./JobViewDrawer";
import JobSearchFilterDrawer from "./JobSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./JobTableConfig";
import { useAPI } from "../../hooks/useAPI";
import { useUserPermission } from "../../hooks/useUserPermission";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const JobTable = ({
    jobData = [],
    pagination = {},
    setUpdateRecords,
    ...props
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const navigate = useNavigate(); // Add this hook at the top level
    const { can } = useUserPermission();

    const { selectionType, rowSelection, handleChange, clearFilters } =
        useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingJob, setViewingJob] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [filterConfig, setFilterConfig] = useState({});
    const [sortOptions, setSortOptions] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});

    // Fetch filter configuration when component mounts
    useEffect(() => {
        fetchFilterConfig();
    }, []);

    const fetchFilterConfig = async () => {
        try {
            const config = await api.getJobsConfig();

            if (config && config.data) {
                setFilterConfig(config.data.filters || {});
                setSortOptions(config.data.sort || []);
            }
        } catch (error) {
            console.error("Error fetching filter config:", error);
            message.error("Failed to load search and filter options");
        }
    };

    const openDrawerForCreate = () => {
        setEditingJob(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (record) => {
        setEditingJob(record);
        setFormDrawerOpen(true);
    };

    const handleView = (record) => {
        setViewingJob(record);
        setViewDrawerOpen(true);
    };

    // Add navigation function for job applications
    const handleViewApplications = (jobId) => {
        navigate(`/jobs/${jobId}/applications`);
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingJob(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingJob(null);
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

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const handleDelete = async (record) => {
        try {
            await api.deleteJob(record.id || record._id);
            message.success("Job deleted successfully");
            // Refresh the table data
            if (setUpdateRecords) {
                setUpdateRecords((prev) => ({ ...prev })); // Trigger refetch
            }
        } catch (error) {
            console.error("Error deleting job:", error);
            message.error("Failed to delete job");
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

    const columns = getJobTableColumns({
        handleView,
        handleEdit,
        handleDelete,
        onViewApplications: handleViewApplications, // Pass the navigation function
    });

    const dataSource = Array.isArray(jobData)
        ? jobData.map((job) => ({
              ...job,
              key: job.id || job._id,
          }))
        : [];

    return (
        <>
            <JobTableToolbar
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
            <JobFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingJob}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <JobViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                jobData={viewingJob}
            />

            {/* Search and filter drawer */}
            <JobSearchFilterDrawer
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

export default JobTable;
