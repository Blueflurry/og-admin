import React from "react";
import { Button, Badge } from "antd";
import {
    PlusOutlined,
    FilterOutlined,
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
    `,
    rightControls: css`
        display: flex;
        gap: 8px;
    `,
}));

const WebinarsTableToolbar = ({
    onSearch,
    onCreateNew,
    onBulkDownload,
    filterActive = false,
}) => {
    const { styles } = useStyle();

    return (
        <div className={styles.tableControls}>
            <div className={styles.leftControls}>
                {/* Left side controls if needed */}
            </div>
            <div className={styles.rightControls}>
                <Badge dot={filterActive} offset={[-5, 5]}>
                    <Button onClick={onSearch} icon={<FilterOutlined />}>
                        Search and Filter
                    </Button>
                </Badge>
                <PermissionGate module="webinars" action="bulkdownload">
                    <Button onClick={onBulkDownload}>
                        <DownloadOutlined />
                        Bulk Download
                    </Button>
                </PermissionGate>
                <PermissionGate module="webinars" action="create">
                    <Button
                        type="primary"
                        onClick={onCreateNew}
                        icon={<PlusOutlined />}
                    >
                        Create New
                    </Button>
                </PermissionGate>
            </div>
        </div>
    );
};

export default WebinarsTableToolbar;
