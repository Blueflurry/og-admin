import React from "react";
import { Button } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";

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

const JobTableToolbar = ({ onSearch, onCreateNew }) => {
    const { styles } = useStyle();

    return (
        <div className={styles.tableControls}>
            <div className={styles.leftControls}>
                {/* Left side controls if needed */}
            </div>
            <div className={styles.rightControls}>
                <Button onClick={onSearch}>
                    <SearchOutlined />
                    Search and Filter
                </Button>
                <Button type="primary" onClick={onCreateNew}>
                    <PlusOutlined />
                    Create New
                </Button>
            </div>
        </div>
    );
};

export default JobTableToolbar;
