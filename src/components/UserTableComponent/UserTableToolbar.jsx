// Updated UserTableToolbar.jsx with filter badge and bulk download
import React from "react";
import { Button, Badge } from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { createStyles } from "antd-style";
import PermissionGate from "../../components/PermissionGate";

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

const UserTableToolbar = ({
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
                    <Button onClick={onSearch}>
                        <SearchOutlined />
                        Search and Filter
                    </Button>
                </Badge>
                <PermissionGate module="users" action="bulkdownload">
                    <Button onClick={onBulkDownload}>
                        <DownloadOutlined />
                        Bulk Download
                    </Button>
                </PermissionGate>
                <PermissionGate module="users" action="create">
                    <Button type="primary" onClick={onCreateNew}>
                        <PlusOutlined />
                        Create New
                    </Button>
                </PermissionGate>
            </div>
        </div>
    );
};

export default UserTableToolbar;
