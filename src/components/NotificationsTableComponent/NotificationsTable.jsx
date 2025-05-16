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
    const { selectionType, rowSelection, handleChange, clearFilters } =
        useTableConfig();

    // State hooks
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingNotification, setViewingNotification] = useState(null);
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

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
            rowSelection: rowSelection
                ? {
                      type: selectionType,
                      ...rowSelection,
                  }
                : null,
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
        rowSelection,
        columns,
        dataSource,
        handleChange,
        pagination,
        onChangePagination,
    ]);

    return (
        <>
            <NotificationsTableToolbar
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
        </>
    );
};

export default NotificationsTable;
