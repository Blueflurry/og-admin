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
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

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

    const { selectionType, handleChange, clearFilters } = useTableConfig();

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
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);

    // Bulk download hook
    const { downloadCSV, downloading } = useBulkDownload();

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
        console.log("🔄 Opening view drawer for job:", record);
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

    // ========================================
    // BULK DOWNLOAD FUNCTIONALITY
    // ========================================

    const handleBulkDownload = () => {
        console.log("🔄 Opening bulk download modal");
        setBulkDownloadModalOpen(true);
    };

    const handleDownloadConfirm = async (limit, filename) => {
        console.log(
            "🔄 Download confirmed with limit:",
            limit,
            "filename:",
            filename
        );

        try {
            // Format job data for CSV export
            const formatJobData = (jobs) => {
                console.log("🔄 Formatting", jobs.length, "jobs for CSV");

                return jobs.map((job, index) => {
                    try {
                        const formattedJob = {
                            "Job ID": job.id || job._id || "",
                            "Job Title": job.title || "",
                            "Company Name": job.company?.data?.name || "",
                            "Company ID":
                                job.company?._id || job.company?.id || "",
                            Category: job.category?.title || job.category || "",
                            "Job Type":
                                job.type === 0
                                    ? "Internship"
                                    : job.type === 1
                                    ? "Contract"
                                    : job.type === 2
                                    ? "Part-time"
                                    : job.type === 3
                                    ? "Full-time"
                                    : "Other",
                            Status: job.status === 1 ? "Active" : "Inactive",
                            Remote: job.isRemote ? "Yes" : "No",
                            "Min Salary": job.minSalary || "",
                            "Max Salary": job.maxSalary || "",
                            "Salary Range":
                                job.salaryRange ||
                                `₹${job.minSalary || 0} - ₹${
                                    job.maxSalary || 0
                                }`,
                            "Min Experience": job.minExperience || "",
                            "Street Address": job.location?.street || "",
                            City: job.location?.city || "",
                            State: job.location?.state || "",
                            Pincode: job.location?.pincode || "",
                            Country: job.location?.country || "",
                            Description: job.description || "",
                            "Created At": job.createdAt
                                ? moment(job.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": job.updatedAt
                                ? moment(job.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                            console.log(
                                "📄 Sample formatted job:",
                                formattedJob
                            );
                        }

                        return formattedJob;
                    } catch (formatError) {
                        console.error(
                            "❌ Error formatting job at index",
                            index,
                            ":",
                            formatError
                        );
                        console.error("❌ Problematic job data:", job);
                        // Return a basic format to prevent the whole process from failing
                        return {
                            "Job ID": job.id || job._id || "Unknown",
                            "Job Title": job.title || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Create fetch function for download
            const fetchJobsForDownload = async () => {
                console.log("📡 Fetching jobs for download...");
                const downloadLimit = limit === "all" ? 999999 : limit;

                const response = await api.getJobs(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    pagination.sort || "",
                    activeFilters
                );

                console.log("📡 Fetch response for download:", response);
                return response;
            };

            console.log("🔄 Starting CSV download with filename:", filename);

            await downloadCSV(
                fetchJobsForDownload,
                filename,
                formatJobData,
                activeFilters,
                pagination.sort || ""
            );

            console.log("✅ Download process completed");
        } catch (downloadError) {
            console.error("❌ Error in handleDownloadConfirm:", downloadError);
            message.error(`Download failed: ${downloadError.message}`);
        } finally {
            // Always close the modal, even if there was an error
            console.log("🔄 Closing download modal");
            setBulkDownloadModalOpen(false);
        }
    };

    return (
        <>
            <JobTableToolbar
                onBulkDownload={handleBulkDownload}
                onCreateNew={openDrawerForCreate}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
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

            {/* Enhanced Bulk download modal */}
            <BulkDownloadModal
                open={bulkDownloadModalOpen}
                onClose={() => {
                    console.log("🔄 Manual close of download modal");
                    setBulkDownloadModalOpen(false);
                }}
                onDownload={handleDownloadConfirm}
                loading={downloading}
                entityName="Jobs"
            />
        </>
    );
};

export default JobTable;
