// src/components/NotificationsTableComponent/NotificationsTable.jsx
import React, { useState } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import NotificationsTableToolbar from "./NotificationsTableToolbar";
import getNotificationsTableColumns from "./NotificationsTableColumns";
import NotificationsFormDrawer from "./NotificationsFormDrawer";
import NotificationsViewDrawer from "./NotificationsViewDrawer";
import NotificationsSearchFilterDrawer from "./NotificationsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./NotificationsTableConfig";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const NotificationsTable = ({
    notificationData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    onCreateNew,
}) => {
    const { styles } = useStyle();
    const { selectionType, rowSelection, handleChange, clearFilters } =
        useTableConfig();

    // State for view and search drawers
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingNotification, setViewingNotification] = useState(null);
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // Hardcoded filter configuration
    const filterConfig = {
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

    // Hardcoded sort options
    const sortOptions = [
        { label: "Newest First", value: "-date" },
        { label: "Oldest First", value: "date" },
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
            setViewingNotification(record);
            setViewDrawerOpen(true);
        }
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingNotification(null);
    };

    const columns = getNotificationsTableColumns({
        handleView: localHandleView,
        handleEdit,
        handleDelete,
    });

    const dataSource = Array.isArray(notificationData)
        ? notificationData.map((notification) => ({
              ...notification,
              key: notification.id || notification._id,
          }))
        : [];

    return (
        <>
            <NotificationsTableToolbar
                onCreateNew={onCreateNew}
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

            {/* View drawer for read-only display */}
            <NotificationsViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                notificationData={viewingNotification}
            />

            {/* Search and filter drawer */}
            <NotificationsSearchFilterDrawer
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

export default NotificationsTable;
