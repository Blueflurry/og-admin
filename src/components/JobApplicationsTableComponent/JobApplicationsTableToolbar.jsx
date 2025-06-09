// src/components/JobApplicationsTableComponent/JobApplicationsTableToolbar.jsx
import React from "react";
import { Button, Badge, Space } from "antd";
import {
    FilterOutlined,
    EditOutlined,
    UsergroupAddOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { createStyles } from "antd-style";
import PermissionGate from "../PermissionGate";

const useStyle = createStyles(({ css }) => ({
    tableControls: css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    `,
    leftControls: css`
        display: flex;
        gap: 8px;
        align-items: center;
    `,
    rightControls: css`
        display: flex;
        gap: 8px;
    `,
    selectedInfo: css`
        padding: 4px 8px;
        background: #e6f7ff;
        border: 1px solid #91d5ff;
        border-radius: 4px;
        font-size: 12px;
        color: #1890ff;
    `,
}));

const JobApplicationsTableToolbar = ({
    onSearch,
    onBulkDownload,
    filterActive = false,
    selectedCount = 0,
    onBulkUpdate,
}) => {
    const { styles } = useStyle();

    return (
        <div className={styles.tableControls}>
            <div className={styles.leftControls}>
                {selectedCount > 0 && (
                    <>
                        <div className={styles.selectedInfo}>
                            <UsergroupAddOutlined style={{ marginRight: 4 }} />
                            {selectedCount} selected
                        </div>
                        {/* Changed from module="jobs" to module="jobApplications" */}
                        <PermissionGate module="jobApplications" action="edit">
                            <Button
                                type="primary"
                                onClick={onBulkUpdate}
                                icon={<EditOutlined />}
                                size="small"
                            >
                                Bulk Update Status
                            </Button>
                        </PermissionGate>
                    </>
                )}
            </div>
            <div className={styles.rightControls}>
                <Badge dot={filterActive} offset={[-5, 5]}>
                    <Button onClick={onSearch} icon={<FilterOutlined />}>
                        Search and Filter
                    </Button>
                </Badge>
                <PermissionGate module="jobApplications" action="bulkdownload">
                    <Button onClick={onBulkDownload}>
                        <DownloadOutlined />
                        Bulk Download
                    </Button>
                </PermissionGate>
                {/* Note: Job applications typically don't have a "Create New" button 
                    as they are created by applicants, not admins */}
            </div>
        </div>
    );
};

export default JobApplicationsTableToolbar;
