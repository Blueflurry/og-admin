import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import WebinarsTableToolbar from "./WebinarsTableToolbar";
import getWebinarsTableColumns from "./WebinarsTableColumns";
import WebinarsFormDrawer from "./WebinarsFormDrawer";
import WebinarsViewDrawer from "./WebinarsViewDrawer";
import WebinarsSearchFilterDrawer from "./WebinarsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./WebinarsTableConfig";
import { useAPI } from "../../hooks/useAPI";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const WebinarsTable = ({
    webinarData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    onCreateNew,
    ...props
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const { selectionType, handleChange, clearFilters } = useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingWebinar, setViewingWebinar] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);

    // Bulk download hook
    const { downloadCSV, downloading } = useBulkDownload();

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
        if (onCreateNew) {
            onCreateNew();
        } else {
            // Fallback behavior if onCreateNew not provided
            setEditingWebinar({ status: 0 });
            setFormDrawerOpen(true);
        }
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

        // Ensure status=0 for webinars
        filters.status = 0;

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
                filters: { ...activeFilters, status: 0 },
            });
        }
    };

    const localHandleView = (record) => {
        if (handleView) {
            handleView(record);
        } else {
            setViewingWebinar(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingWebinar(record);
            setFormDrawerOpen(true);
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingWebinar(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingWebinar(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    // ========================================
    // BULK DOWNLOAD FUNCTIONALITY
    // ========================================

    const handleBulkDownload = () => {
        setBulkDownloadModalOpen(true);
    };

    const handleDownloadConfirm = async (limit, filename) => {
        try {
            // Format webinar data for CSV export
            const formatWebinarData = (webinars) => {
                return webinars.map((webinar, index) => {
                    try {
                        const formattedWebinar = {
                            "Webinar ID": webinar.id || webinar._id || "",
                            Title: webinar.title || "",
                            Description: webinar.description || "",
                            Status:
                                webinar.status === 1 ? "Active" : "Inactive",
                            "Duration (minutes)": webinar.duration || "",
                            "Start Date": webinar.startDate
                                ? moment(webinar.startDate).format("DD/MM/YYYY")
                                : "",
                            "End Date": webinar.endDate
                                ? moment(webinar.endDate).format("DD/MM/YYYY")
                                : "",
                            "Start Time": webinar.startTime || "",
                            "End Time": webinar.endTime || "",
                            "Host/Presenter":
                                webinar.instructor ||
                                webinar.host ||
                                webinar.presenter ||
                                "",
                            "Topic/Category":
                                webinar.category || webinar.topic || "",
                            Level: webinar.level || "",
                            Prerequisites: webinar.prerequisites || "",
                            "Max Attendees":
                                webinar.maxStudents ||
                                webinar.maxAttendees ||
                                "",
                            "Registered Attendees":
                                webinar.enrolled ||
                                webinar.registeredCount ||
                                "",
                            "Registration Fee":
                                webinar.price || webinar.fee || "",
                            Currency: webinar.currency || "",
                            Language: webinar.language || "",
                            "Certificate Provided": webinar.certificateProvided
                                ? "Yes"
                                : "No",
                            "Recording Available": webinar.recordingAvailable
                                ? "Yes"
                                : "No",
                            "Meeting Platform":
                                webinar.platform ||
                                webinar.meetingPlatform ||
                                "",
                            "Meeting URL":
                                webinar.meetingUrl || webinar.joinUrl || "",
                            "Meeting ID": webinar.meetingId || "",
                            Password: webinar.password || "",
                            "Webinar Type":
                                webinar.webinarType || webinar.type || "",
                            "Is Live": webinar.isLive ? "Yes" : "No",
                            Timezone: webinar.timezone || "",
                            "Materials URL": webinar.materialsUrl || "",
                            "Slides URL": webinar.slidesUrl || "",
                            "Recording URL": webinar.recordingUrl || "",
                            "Image URL": webinar.imageUrl,
                            "Registration URL": webinar.registrationUrl || "",
                            Tags: Array.isArray(webinar.tags)
                                ? webinar.tags.join(", ")
                                : webinar.tags || "",
                            "Created At": webinar.createdAt
                                ? moment(webinar.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": webinar.updatedAt
                                ? moment(webinar.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                        }

                        return formattedWebinar;
                    } catch (formatError) {
                        // Return a basic format to prevent the whole process from failing
                        return {
                            "Webinar ID":
                                webinar.id || webinar._id || "Unknown",
                            Title: webinar.title || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Create fetch function for download
            const fetchWebinarsForDownload = async () => {
                const downloadLimit = limit === "all" ? -1 : limit;

                // Ensure status=0 for webinars (not courses)
                const webinarFilters = { ...activeFilters, status: 0 };

                const response = await api.getWebinars(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    pagination.sort || "",
                    webinarFilters
                );

                return response;
            };

            await downloadCSV(
                fetchWebinarsForDownload,
                filename,
                formatWebinarData,
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

    const columns = getWebinarsTableColumns({
        handleView: localHandleView,
        handleEdit: localHandleEdit,
        handleDelete,
    });

    const dataSource = Array.isArray(webinarData)
        ? webinarData.map((webinar) => ({
              ...webinar,
              key: webinar.id || webinar._id,
          }))
        : [];

    return (
        <>
            <WebinarsTableToolbar
                onBulkDownload={handleBulkDownload}
                onCreateNew={openDrawerForCreate} // Use the one passed from parent
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
            <WebinarsFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingWebinar}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <WebinarsViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                courseData={viewingWebinar}
            />

            {/* Search and filter drawer */}
            <WebinarsSearchFilterDrawer
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
                entityName="Webinars"
            />
        </>
    );
};

export default WebinarsTable;
