import React, { useState } from "react";
import { Table } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import JobTableToolbar from "./JobTableToolbar";
import getJobTableColumns from "./JobTableColumns";
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

    const handleDelete = async (record) => {
        try {
            await api.deleteJob(record.id || record._id);
            // Refresh the table data
            if (setUpdateRecords) {
                setUpdateRecords((prev) => ({ ...prev })); // Trigger refetch
            }
        } catch (error) {
            console.error("Error deleting job:", error);
        }
    };

    const onChangePagination = (page, pageSize) => {
        setUpdateRecords((prev) => ({ ...prev, page: page, limit: pageSize }));
    };

    const columns = getJobTableColumns({
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
                onCreateNew={() => console.log("Create new job")}
                onSearch={() => console.log("Search jobs")}
            />

            <Table
                className={styles.customTable}
                size="middle"
                scroll={{ x: "max-content" }}
                rowSelection={Object.assign(
                    { type: selectionType },
                    rowSelection
                )}
                columns={columns}
                dataSource={dataSource}
                onChange={handleChange}
                pagination={getPaginationConfig({
                    pagination,
                    onChangePagination,
                })}
            />
        </>
    );
};

export default JobTable;
