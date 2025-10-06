import React, { useState, useEffect, useMemo } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import NotificationsTableToolbar from "./NotificationsTableToolbar";
import getNotificationsTableColumns from "./NotificationsTableColumns";
import NotificationsViewDrawer from "./NotificationsViewDrawer";
import NotificationsSearchFilterDrawer from "./NotificationsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./NotificationsTableConfig";
import { useUserPermission } from "../../hooks/useUserPermission";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import { useAPI } from "../../hooks/useAPI";
import dayjs from "dayjs";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

// Define these outside the component to prevent recreation
const DEFAULT_FILTER_CONFIG = {
    title: { type: "text", label: "Title" },
    text: { type: "text", label: "Text" },
    date: { type: "date", label: "Date" },
    repeat: {
        type: "multi-select",
        label: "Repeat",
        options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
        ],
    },
};

const DEFAULT_SORT_OPTIONS = [
    { label: "Newest First", value: "-date" },
    { label: "Oldest First", value: "date" },
];

const NotificationsTable = ({
    notificationData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    onCreateNew,
}) => {
    // All hooks at the top
    const { styles } = useStyle();
    const { can } = useUserPermission();
    const { api } = useAPI();
    const { selectionType, handleChange, clearFilters } = useTableConfig();

    // State hooks
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingNotification, setViewingNotification] = useState(null);
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);

    // Bulk download hook
    const { downloadCSV, downloading } = useBulkDownload();

    // Use static configs defined outside component
    const filterConfig = DEFAULT_FILTER_CONFIG;
    const sortOptions = DEFAULT_SORT_OPTIONS;

    // Handler functions
    const openSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(true);
    };

    const closeSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(false);
    };

    const handleApplyFilters = (filters) => {
        const sortValue = filters.sort || "";
        delete filters.sort;
        setActiveFilters(filters);

        if (setUpdateRecords) {
            setUpdateRecords({
                page: 1,
                limit: pagination.limit || 10,
                sort: sortValue,
                filters: filters,
            });
        }

        message.success("Filters applied successfully");
    };

    const onChangePagination = (page, pageSize) => {
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
            setViewingNotification(record);
            setViewDrawerOpen(true);
        }
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingNotification(null);
    };

    // ========================================
    // BULK DOWNLOAD FUNCTIONALITY
    // ========================================

    const handleBulkDownload = () => {
        setBulkDownloadModalOpen(true);
    };

    const handleDownloadConfirm = async (limit, filename) => {
        try {
            // Format notification data for CSV export
            const formatNotificationData = (notifications) => {
                return notifications.map((notification, index) => {
                    try {
                        const formattedNotification = {
                            "Notification ID":
                                notification.id || notification._id || "",
                            Title: notification.title || "",
                            "Text/Message":
                                notification.text || notification.message || "",
                            Date: notification.date
                                ? dayjs(notification.date).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            Repeat: notification.repeat ? "Yes" : "No",
                            Type: notification.type || "",
                            Recipients: notification.recipients || "",
                            Status: notification.status || "",
                            Priority: notification.priority || "",
                            Category: notification.category || "",
                            "Delivery Method":
                                notification.deliveryMethod || "",
                            "Sent Count": notification.sentCount || "",
                            "Delivered Count":
                                notification.deliveredCount || "",
                            "Failed Count": notification.failedCount || "",
                            "Click Count": notification.clickCount || "",
                            "Is Scheduled": notification.isScheduled
                                ? "Yes"
                                : "No",
                            "Scheduled Date": notification.scheduledDate
                                ? dayjs(notification.scheduledDate).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Created At": notification.createdAt
                                ? dayjs(notification.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": notification.updatedAt
                                ? dayjs(notification.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                        }

                        return formattedNotification;
                    } catch (formatError) {
                        // Return a basic format to prevent the whole process from failing
                        return {
                            "Notification ID":
                                notification.id ||
                                notification._id ||
                                "Unknown",
                            Title: notification.title || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Create fetch function for download
            const fetchNotificationsForDownload = async () => {
                const downloadLimit = limit === "all" ? -1 : limit;

                const response = await api.getNotifications(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    pagination.sort || "",
                    activeFilters
                );

                return response;
            };

            await downloadCSV(
                fetchNotificationsForDownload,
                filename,
                formatNotificationData,
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

    // Memoize columns with dependencies
    const columns = useMemo(() => {
        // Pass the can function to columns
        return getNotificationsTableColumns({
            handleView: localHandleView,
            handleEdit,
            handleDelete,
            can,
        });
    }, [localHandleView, handleEdit, handleDelete, can]);

    // Prepare data source with useMemo
    const dataSource = useMemo(() => {
        if (!Array.isArray(notificationData)) return [];

        return notificationData.map((notification) => ({
            ...notification,
            key: notification.id || notification._id,
        }));
    }, [notificationData]);

    // IMPORTANT: Create a stable table props object to prevent reordering of internal hooks
    const tableProps = useMemo(() => {
        return {
            className: styles.customTable,
            size: "middle",
            scroll: { x: "max-content" },
            columns,
            dataSource,
            onChange: handleChange,
            pagination: getPaginationConfig({
                pagination,
                onChangePagination,
            }),
        };
    }, [
        styles.customTable,
        selectionType,
        columns,
        dataSource,
        handleChange,
        pagination,
        onChangePagination,
    ]);

    return (
        <>
            <NotificationsTableToolbar
                onBulkDownload={handleBulkDownload}
                onCreateNew={onCreateNew}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            {/* Use spread operator to pass all props at once */}
            <Table {...tableProps} />

            <NotificationsViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                notificationData={viewingNotification}
            />

            <NotificationsSearchFilterDrawer
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
                entityName="Notifications"
            />
        </>
    );
};

export default NotificationsTable;
