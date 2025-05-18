// src/components/ReferralsTableComponent/ReferralsTable.jsx
import React, { useState, useMemo } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

import ReferralsTableToolbar from "./ReferralsTableToolbar";
import getReferralsTableColumns from "./ReferralsTableColumns";
import ReferralsSearchFilterDrawer from "./ReferralsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ReferralsTableConfig";
import { useUserPermission } from "../../hooks/useUserPermission";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

// Static configurations
const DEFAULT_FILTER_CONFIG = {
    friendName: { type: "text", label: "Friend's Name" },
    friendPhone: { type: "text", label: "Friend's Phone" },
    "data.name.first": { type: "text", label: "Referrer's First Name" },
    "data.name.last": { type: "text", label: "Referrer's Last Name" },
    "data.phone1": { type: "text", label: "Referrer's Phone" },
    "courseDetails.courseName": { type: "text", label: "Course Name" },
    "courseDetails.courseId": { type: "text", label: "Course ID" },
    status: {
        type: "multi-select",
        label: "Status",
        options: [
            { value: 0, label: "Pending" },
            { value: 1, label: "Success" },
            { value: 2, label: "Rejected" },
        ],
    },
    createdAt: { type: "date", label: "Created Date" },
};

const DEFAULT_SORT_OPTIONS = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
];

const ReferralsTable = ({
    referralData = [],
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
    const { selectionType, rowSelection, handleChange } = useTableConfig();

    // State hooks
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // Use static configs
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

    // Memoize columns with dependencies
    const columns = useMemo(() => {
        return getReferralsTableColumns({
            handleView,
            handleEdit,
            handleDelete,
            can,
        });
    }, [handleView, handleEdit, handleDelete, can]);

    // Prepare data source with useMemo
    const dataSource = useMemo(() => {
        if (!Array.isArray(referralData)) return [];

        return referralData.map((referral) => ({
            ...referral,
            key: referral.id || referral._id,
        }));
    }, [referralData]);

    // Create a stable table props object
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
            <ReferralsTableToolbar
                onCreateNew={onCreateNew}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table {...tableProps} />

            <ReferralsSearchFilterDrawer
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

export default ReferralsTable;
