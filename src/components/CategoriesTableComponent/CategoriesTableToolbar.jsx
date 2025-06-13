// src/components/CategoriesTableComponent/CategoriesTableToolbar.jsx
import React from "react";
import { Button, Badge, Space } from "antd";
import {
    PlusOutlined,
    FilterOutlined,
    DownloadOutlined,
    UsergroupAddOutlined,
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

const CategoriesTableToolbar = ({
    onSearch,
    onCreateNew,
    filterActive = false,
    selectedCount = 0,
    onBulkDownload,
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
                        <PermissionGate
                            module="categories"
                            action="bulkdownload"
                        >
                            <Button
                                onClick={onBulkDownload}
                                icon={<DownloadOutlined />}
                                size="small"
                            >
                                Bulk Download
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
                <PermissionGate module="categories" action="create">
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

export default CategoriesTableToolbar;
