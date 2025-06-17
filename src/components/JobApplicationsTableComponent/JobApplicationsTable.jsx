// src/components/JobApplicationsTableComponent/JobApplicationsTable.jsx
import React, { useState, useEffect } from "react";
import { Table, message, Button, Modal, Select, Space } from "antd";
import { createStyles } from "antd-style";
import { ExclamationCircleOutlined, EditOutlined } from "@ant-design/icons";

// Import separated components and utilities
import JobApplicationsTableToolbar from "./JobApplicationsTableToolbar";
import getJobApplicationsTableColumns from "./JobApplicationsTableColumns";
import JobApplicationsFormDrawer from "./JobApplicationsFormDrawer";
import JobApplicationsViewDrawer from "./JobApplicationsViewDrawer";
import JobApplicationsSearchFilterDrawer from "./JobApplicationsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./JobApplicationsTableConfig";
import { useAPI } from "../../hooks/useAPI";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

const { confirm } = Modal;
const { Option } = Select;
const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const JobApplicationsTable = ({
    applicationData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    handleBulkUpdate,
    jobDetails,
    ...props
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const { selectionType, handleChange, clearFilters } = useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingApplication, setViewingApplication] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // State for bulk operations
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [bulkUpdateVisible, setBulkUpdateVisible] = useState(false);
    const [bulkUpdateStatus, setBulkUpdateStatus] = useState(undefined);
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);

    // Bulk download hook
    const { downloadCSV, downloading } = useBulkDownload();

    // Updated filter configuration to match actual API data structure
    const filterConfig = {
        "user.data.name.first": { type: "text", label: "First Name" },
        "user.data.name.last": { type: "text", label: "Last Name" },
        "user.data.email": { type: "text", label: "Email" },
        "user.data.phone1": { type: "text", label: "Phone" },
        status: {
            type: "multi-select",
            label: "Status",
            options: [
                { value: 0, label: "Applied" },
                { value: 1, label: "Under Review" },
                { value: 2, label: "Shortlisted" },
                { value: 3, label: "Rejected" },
                { value: 4, label: "Hired" },
            ],
        },
    };

    // Updated sort options
    const sortOptions = [
        { label: "Newest First", value: "-createdAt" },
        { label: "Oldest First", value: "createdAt" },
    ];

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
            setViewingApplication(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingApplication(record);
            setFormDrawerOpen(true);
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingApplication(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingApplication(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const handleBulkStatusUpdate = () => {
        setBulkUpdateVisible(true);
    };

    const handleBulkUpdateConfirm = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select applications to update");
            return;
        }

        if (bulkUpdateStatus === undefined) {
            message.warning("Please select a status");
            return;
        }

        confirm({
            title: `Update ${selectedRowKeys.length} applications?`,
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to update the status of ${selectedRowKeys.length} selected applications?`,
            okText: "Yes",
            okType: "primary",
            cancelText: "No",
            onOk: async () => {
                try {
                    await handleBulkUpdate(selectedRowKeys, {
                        status: bulkUpdateStatus,
                    });
                    setSelectedRowKeys([]);
                    setBulkUpdateVisible(false);
                    setBulkUpdateStatus(undefined);
                } catch (error) {
                    console.error("Bulk update error:", error);
                }
            },
        });
    };

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
            // Format job application data for CSV export
            const formatJobApplicationData = (applications) => {
                console.log(
                    "🔄 Formatting",
                    applications.length,
                    "job applications for CSV"
                );

                return applications.map((app, index) => {
                    try {
                        // Handle different possible data structures
                        const applicant =
                            app.applicant || app.user?.data || app.user || {};
                        const applicantName = applicant.name || {};

                        const formattedApplication = {
                            "Application ID": app.id || app._id || "",
                            "Job ID":
                                app.jobId || app.job?.id || app.job?._id || "",
                            "Job Title":
                                app.job?.title || jobDetails?.title || "",
                            Company:
                                app.job?.company?.name ||
                                jobDetails?.company?.data?.name ||
                                "",
                            "Applicant First Name":
                                applicantName.first ||
                                applicant.firstName ||
                                "",
                            "Applicant Last Name":
                                applicantName.last || applicant.lastName || "",
                            "Applicant Full Name":
                                `${applicantName.first || ""} ${
                                    applicantName.last || ""
                                }`.trim() ||
                                `${applicant.firstName || ""} ${
                                    applicant.lastName || ""
                                }`.trim(),
                            Email: applicant.email || "",
                            Phone: applicant.phone1 || applicant.phone || "",
                            "Secondary Phone": applicant.phone2 || "",
                            Status:
                                app.status === 0
                                    ? "Applied"
                                    : app.status === 1
                                    ? "Under Review"
                                    : app.status === 2
                                    ? "Shortlisted"
                                    : app.status === 3
                                    ? "Rejected"
                                    : app.status === 4
                                    ? "Hired"
                                    : "Unknown",
                            "Experience Years": app.experience || "",
                            "Expected Salary": app.expectedSalary || "",
                            "Notice Period": app.noticePeriod || "",
                            "Current Company": app.currentCompany || "",
                            "Resume URL": app.resumeUrl || app.resume || "",
                            "Cover Letter": app.coverLetter || "",
                            Notes: app.notes || "",
                            "Applied Date":
                                app.createdAt || app.appliedDate
                                    ? moment(
                                          app.createdAt || app.appliedDate
                                      ).format("DD/MM/YYYY HH:mm")
                                    : "",
                            "Last Updated": app.updatedAt
                                ? moment(app.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Street Address": applicant.address?.street || "",
                            City: applicant.address?.city || "",
                            State: applicant.address?.state || "",
                            Pincode: applicant.address?.pincode || "",
                            Country: applicant.address?.country || "",
                        };

                        if (index === 0) {
                            console.log(
                                "📄 Sample formatted application:",
                                formattedApplication
                            );
                        }

                        return formattedApplication;
                    } catch (formatError) {
                        console.error(
                            "❌ Error formatting application at index",
                            index,
                            ":",
                            formatError
                        );
                        console.error("❌ Problematic application data:", app);
                        // Return a basic format to prevent the whole process from failing
                        return {
                            "Application ID": app.id || app._id || "Unknown",
                            Status:
                                app.status !== undefined
                                    ? app.status === 0
                                        ? "Applied"
                                        : app.status === 1
                                        ? "Under Review"
                                        : app.status === 2
                                        ? "Shortlisted"
                                        : app.status === 3
                                        ? "Rejected"
                                        : app.status === 4
                                        ? "Hired"
                                        : "Unknown"
                                    : "Error formatting",
                        };
                    }
                });
            };

            // Create fetch function for download - Note: This will need the jobId
            const fetchApplicationsForDownload = async () => {
                console.log("📡 Fetching job applications for download...");
                const downloadLimit = limit === "all" ? 999999 : limit;

                // Get jobId from jobDetails or from the current context
                const jobId = jobDetails?.id || jobDetails?._id;
                if (!jobId) {
                    throw new Error(
                        "Job ID not found for downloading applications"
                    );
                }

                const response = await api.getJobApplications(
                    jobId,
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
                fetchApplicationsForDownload,
                filename,
                formatJobApplicationData,
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

    const columns = getJobApplicationsTableColumns({
        handleView: localHandleView,
        handleEdit: localHandleEdit,
        handleDelete,
    });

    const dataSource = Array.isArray(applicationData)
        ? applicationData.map((application) => ({
              ...application,
              key: application.id || application._id,
          }))
        : [];

    return (
        <>
            <JobApplicationsTableToolbar
                onBulkDownload={handleBulkDownload}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
                selectedCount={selectedRowKeys.length}
                onBulkUpdate={handleBulkStatusUpdate}
            />

            {/* Bulk Update Modal */}
            <Modal
                title="Bulk Update Status"
                open={bulkUpdateVisible}
                onCancel={() => setBulkUpdateVisible(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setBulkUpdateVisible(false)}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleBulkUpdateConfirm}
                        icon={<EditOutlined />}
                    >
                        Update {selectedRowKeys.length} Applications
                    </Button>,
                ]}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <div>Selected {selectedRowKeys.length} applications</div>
                    <Select
                        placeholder="Select new status"
                        style={{ width: "100%" }}
                        value={bulkUpdateStatus}
                        onChange={setBulkUpdateStatus}
                    >
                        <Option value={0}>Applied</Option>
                        <Option value={1}>Under Review</Option>
                        <Option value={2}>Shortlisted</Option>
                        <Option value={3}>Rejected</Option>
                        <Option value={4}>Hired</Option>
                    </Select>
                </Space>
            </Modal>

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

            {/* Form drawer for edit */}
            <JobApplicationsFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingApplication}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <JobApplicationsViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                applicationData={viewingApplication}
                jobDetails={jobDetails}
            />

            {/* Search and filter drawer */}
            <JobApplicationsSearchFilterDrawer
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
                entityName="Job Applications"
            />
        </>
    );
};

export default JobApplicationsTable;
