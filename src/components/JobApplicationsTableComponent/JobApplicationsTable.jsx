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
        setBulkDownloadModalOpen(true);
    };

    const calculateTotalExperience = (experienceData) => {
        if (!experienceData || !Array.isArray(experienceData)) return 0;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

        let totalMonths = 0;

        experienceData.forEach((job) => {
            // Parse start date
            const [startMonth, startYear] = job.startYear
                .split("/")
                .map(Number);

            let endMonth, endYear;

            if (job.isCurrent) {
                // For current job, use current date
                endMonth = currentMonth;
                endYear = currentYear;
            } else {
                // Parse end date
                [endMonth, endYear] = job.endYear.split("/").map(Number);
            }

            // Calculate months for this job
            const monthsInJob =
                (endYear - startYear) * 12 + (endMonth - startMonth);
            totalMonths += monthsInJob;
        });

        // Convert total months to years and months
        const totalYears = Math.floor(totalMonths / 12);

        // Return only years as number
        return totalYears;
    };

    const getCurrentCompany = (experienceData) => {
        if (!experienceData || !Array.isArray(experienceData)) return null;
        const currentJob = experienceData.find((job) => job.isCurrent === true);
        return currentJob ? currentJob.companyName : null;
    };

    const handleDownloadConfirm = async (limit, filename) => {
        try {
            // Format job application data for CSV export
            const formatJobApplicationData = (applications) => {
                return applications.map((app, index) => {
                    try {
                        // Correct data structure: user is at app.user, experience is at app.user.data.experience
                        const applicant = app.user || app.user?.data || {};
                        const applicantName = applicant.data.name || {};
                        const address =
                            applicant.address || applicant?.data?.address || {};
                        const experience = app.user?.data?.experience || [];

                        const formattedApplication = {
                            "Application ID": app.id || app._id || "",
                            "Job ID":
                                app.job?._id || app.jobId || app.job?.id || "",
                            "Job Title": app.job?.title || "",
                            Company:
                                app.job?.company?.data?.name ||
                                app.job?.company?.name ||
                                "",
                            "User ID": applicant.id || applicant._id || "",
                            "First Name": applicantName.first || "",
                            "Last Name": applicantName.last || "",
                            // "Full Name": `${applicantName.data.first || ""} ${
                            //     applicantName.data.last || ""
                            // }`.trim(),
                            Email: applicant.data.email || "",
                            Phone: applicant.data.phone1 || "",
                            "Secondary Phone": applicant.data.phone2 || "",
                            "Date of Birth": applicant.data.dob
                                ? moment(applicant.data.dob).format(
                                      "DD/MM/YYYY"
                                  )
                                : "",
                            // Role: applicant.role || "",
                            // "User App Role": applicant.userAppRole || "",
                            "Application Status":
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
                            "Total Experience (Years)":
                                experience.length > 0
                                    ? calculateTotalExperience(experience)
                                    : 0,
                            "Current Company":
                                experience.length > 0
                                    ? getCurrentCompany(experience)
                                    : "",
                            "Street Address": address.street || "",
                            City: address.city || "",
                            State: address.state || "",
                            Pincode: address.pincode || "",
                            Country: address.country || "",
                            "Profile Image URL":
                                app.user?.data?.imageUrl ||
                                app.user?.data?.imgUrl ||
                                "",
                            "Resume URL":
                                app.user?.data?.resume?.resumeUrl || "",
                            // "Cover Letter": app.coverLetter || "",
                            // Notes: app.notes || "",
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

                            // Experience Details (flattened)
                            "Experience Count": experience.length,
                            "Experience Details": experience
                                .map(
                                    (exp, idx) =>
                                        `${idx + 1}. ${exp.title} at ${
                                            exp.companyName
                                        } (${exp.startYear} - ${
                                            exp.isCurrent
                                                ? "Current"
                                                : exp.endYear
                                        })`
                                )
                                .join(" | "),

                            // Current Job Details
                            "Current Job Title": (() => {
                                const currentJob = experience.find(
                                    (job) => job.isCurrent
                                );
                                return currentJob ? currentJob.title : "";
                            })(),
                            "Current Job Start Date": (() => {
                                const currentJob = experience.find(
                                    (job) => job.isCurrent
                                );
                                return currentJob ? currentJob.startYear : "";
                            })(),
                            "Current Job Employment Type": (() => {
                                const currentJob = experience.find(
                                    (job) => job.isCurrent
                                );
                                return currentJob
                                    ? currentJob.employmentType
                                    : "";
                            })(),

                            // Previous Job Details (most recent non-current)
                            "Previous Job Title": (() => {
                                const previousJobs = experience.filter(
                                    (job) => !job.isCurrent
                                );
                                return previousJobs.length > 0
                                    ? previousJobs[previousJobs.length - 1]
                                          .title
                                    : "";
                            })(),
                            "Previous Company": (() => {
                                const previousJobs = experience.filter(
                                    (job) => !job.isCurrent
                                );
                                return previousJobs.length > 0
                                    ? previousJobs[previousJobs.length - 1]
                                          .companyName
                                    : "";
                            })(),
                            "Previous Job Duration": (() => {
                                const previousJobs = experience.filter(
                                    (job) => !job.isCurrent
                                );
                                if (previousJobs.length > 0) {
                                    const prevJob =
                                        previousJobs[previousJobs.length - 1];
                                    return `${prevJob.startYear} - ${prevJob.endYear}`;
                                }
                                return "";
                            })(),
                        };

                        return formattedApplication;
                    } catch (formatError) {
                        console.error(
                            "Error formatting application:",
                            formatError
                        );
                        // Return a basic format to prevent the whole process from failing
                        return {
                            "Application ID": app.id || app._id || "Unknown",
                            Email:
                                app.user?.data?.email || app.user?.email || "",
                            "First Name":
                                app.user?.data?.name?.first ||
                                app.user?.name?.first ||
                                "",
                            Phone:
                                app.user?.data?.phone1 ||
                                app.user?.phone1 ||
                                "",
                            "Application Status":
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
                            Error: "Error formatting data - check console for details",
                        };
                    }
                });
            };

            // Create fetch function for download
            const fetchApplicationsForDownload = async () => {
                const downloadLimit = limit === "all" ? -1 : limit;

                const response = await api.getAllJobApplications(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    pagination.sort || ""
                );

                return response;
            };

            await downloadCSV(
                fetchApplicationsForDownload,
                filename,
                formatJobApplicationData,
                activeFilters,
                pagination.sort || ""
            );
        } catch (downloadError) {
            message.error(`Download failed: ${downloadError.message}`);
        } finally {
            // Always close the modal, even if there was an error
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
