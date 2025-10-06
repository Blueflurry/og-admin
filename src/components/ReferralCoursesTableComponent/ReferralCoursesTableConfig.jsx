import React from "react";
import { Table } from "antd";

const ReferralCoursesTableConfig = {
    scroll: { x: 1000 },
    size: "middle",
    bordered: true,
    showHeader: true,
    pagination: {
        position: ["bottomRight"],
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ["10", "20", "50", "100"],
        defaultPageSize: 10,
    },
    rowKey: (record) => record.id || record._id,
    rowClassName: (record, index) =>
        index % 2 === 0 ? "table-row-light" : "table-row-dark",
};

export default ReferralCoursesTableConfig;
