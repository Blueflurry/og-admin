import React, { useState } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import JobTableToolbar from "./JobTableToolbar";
import getJobTableColumns from "./JobTableColumns";
import JobFormDrawer from "./JobFormDrawer";
import JobViewDrawer from "./JobViewDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./JobTableConfig";
import { useAPI } from "../../hooks/useAPI";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const JobTable = ({
    jobData = [],
    pagination = {},
    setUpdateRecords,
    ...props
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const { selectionType, rowSelection, handleChange, clearFilters } =
        useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingJob, setViewingJob] = useState(null);

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

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingJob(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingJob(null);
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
        // Update records with new page and limit values
        if (setUpdateRecords) {
            setUpdateRecords({
                page: page,
                limit: pageSize,
                sort: "",
            });
        }
    };

    const columns = getJobTableColumns({
        handleView,
        handleEdit,
        handleDelete,
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
                onSearch={() => console.log("Search jobs")}
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
        </>
    );
};

export default JobTable;
