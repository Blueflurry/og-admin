// This file can contain table-related configurations and hooks
import { useState } from "react";

export const useTableConfig = () => {
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [selectionType, setSelectionType] = useState("checkbox");

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(
                `selectedRowKeys: ${selectedRowKeys}`,
                "selectedRows: ",
                selectedRows
            );
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === "Disabled User",
            name: record.name,
        }),
    };

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
        return { pagination, filters, sorter };
    };

    const clearFilters = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };

    const setAgeSort = () => {
        setSortedInfo({
            order: "descend",
            columnKey: "age",
        });
    };

    return {
        filteredInfo,
        sortedInfo,
        selectionType,
        rowSelection,
        handleChange,
        clearFilters,
        setAgeSort,
    };
};

export const getPaginationConfig = ({ pagination, onChangePagination }) => ({
    position: ["bottomRight"],
    showQuickJumper: true,
    showSizeChanger: true,
    defaultCurrent: 1,
    defaultPageSize: 10,
    total: pagination.totalDocs,
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
