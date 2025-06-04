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
        { label: "By Status", value: "status" },
        { label: "By Name", value: "user.data.name.first" },
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

    // Bulk operations
    const rowSelection = {
        type: selectionType,
        selectedRowKeys,
        onChange: (newSelectedRowKeys, selectedRows) => {
            console.log("selectedRowKeys changed: ", newSelectedRowKeys);
            setSelectedRowKeys(newSelectedRowKeys);
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === "Disabled Application",
            name: record.name,
        }),
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
                rowSelection={rowSelection}
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
        </>
    );
};

export default JobApplicationsTable;
