// src/components/CategoriesTableComponent/CategoriesTableConfig.jsx
import { useState } from "react";

export const useTableConfig = () => {
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [selectionType, setSelectionType] = useState("checkbox");

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
        return { pagination, filters, sorter };
    };

    const clearFilters = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };

    return {
        filteredInfo,
        sortedInfo,
        selectionType,
        handleChange,
        clearFilters,
    };
};

export const getPaginationConfig = ({ pagination, onChangePagination }) => ({
    position: ["bottomRight"],
    showQuickJumper: true,
    showSizeChanger: true,
    current: pagination?.page || 1,
    pageSize: pagination?.limit || 10,
    total: pagination?.totalDocs || 0,
    size: "default",
    onChange: onChangePagination,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
});

export const tableStyles = (css, token) => {
    const { antCls } = token;
    return {
        customTable: css`
            ${antCls}-table {
                ${antCls}-table-thead > tr > th {
                    text-align: center !important;
                }

                ${antCls}-table-container {
                    ${antCls}-table-body,
                    ${antCls}-table-content {
                        scrollbar-width: thin;
                        scrollbar-color: #eaeaea transparent;
                        scrollbar-gutter: stable;
                    }
                }
            }
        `,
    };
};
