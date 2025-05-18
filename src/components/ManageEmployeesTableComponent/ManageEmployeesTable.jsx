// ManageEmployeesTable.jsx
import React, { useState } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import ManageEmployeesTableToolbar from "./ManageEmployeesTableToolbar";
import getManageEmployeesTableColumns from "./ManageEmployeesTableColumns";
import ManageEmployeesFormDrawer from "./ManageEmployeesFormDrawer";
import ManageEmployeesViewDrawer from "./ManageEmployeesViewDrawer";
import ManageEmployeesSearchFilterDrawer from "./ManageEmployeesSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ManageEmployeesTableConfig";
import { useAPI } from "../../hooks/useAPI";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const ManageEmployeesTable = ({
    employeeData = [],
    pagination = {},
    setUpdateRecords,
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const { selectionType, rowSelection, handleChange } = useTableConfig();

    // State for form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    // State for view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingEmployee, setViewingEmployee] = useState(null);

    // State for search filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // Handler functions
    const openDrawerForCreate = () => {
        setEditingEmployee(null);
        setFormDrawerOpen(true);
    };

    const handleView = (employee) => {
        setViewingEmployee(employee);
        setViewDrawerOpen(true);
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormDrawerOpen(true);
    };

    const handleDelete = async (employee) => {
        try {
            await api.deleteManageEmployees(employee.id || employee._id);
            message.success("Employee deleted successfully");

            if (setUpdateRecords) {
                setUpdateRecords((prev) => ({ ...prev }));
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            message.error("Failed to delete employee");
        }
    };

    const handleFormSuccess = () => {
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    };

    const handleApplyFilters = (filters) => {
        const sortValue = filters.sort || "";
        delete filters.sort;
        setActiveFilters(filters);

        if (setUpdateRecords) {
            setUpdateRecords({
                page: 1,
                limit: pagination.limit || 10,
                sort: sortValue,
                filters: filters,
            });
        }

        message.success("Filters applied successfully");
    };

    const onChangePagination = (page, pageSize) => {
        if (setUpdateRecords) {
            setUpdateRecords({
                page: page,
                limit: pageSize,
                sort: pagination.sort || "",
                filters: activeFilters,
            });
        }
    };

    // Get columns
    const columns = getManageEmployeesTableColumns({
        handleView,
        handleEdit,
        handleDelete,
    });

    // Prepare data source
    const dataSource = Array.isArray(employeeData)
        ? employeeData.map((employee) => ({
              ...employee,
              key: employee.id || employee._id,
          }))
        : [];

    return (
        <>
            <ManageEmployeesTableToolbar
                onCreateNew={openDrawerForCreate}
                onSearch={() => setSearchFilterDrawerOpen(true)}
                filterActive={Object.keys(activeFilters).length > 0}
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
            <ManageEmployeesFormDrawer
                open={formDrawerOpen}
                onClose={() => setFormDrawerOpen(false)}
                initialValues={editingEmployee}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for detailed view */}
            <ManageEmployeesViewDrawer
                open={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                employeeData={viewingEmployee}
            />

            {/* Search filter drawer */}
            <ManageEmployeesSearchFilterDrawer
                open={searchFilterDrawerOpen}
                onClose={() => setSearchFilterDrawerOpen(false)}
                onApplyFilters={handleApplyFilters}
                initialValues={{ ...activeFilters, sort: pagination.sort }}
            />
        </>
    );
};

export default ManageEmployeesTable;
