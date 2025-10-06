import React, { useState, useMemo } from "react";
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
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import dayjs from "dayjs";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

// Define static configs outside component
const DEFAULT_FILTER_CONFIG = {
    "name.first": { type: "text", label: "First Name" },
    "name.last": { type: "text", label: "Last Name" },
    email: { type: "text", label: "Email" },
    phone1: { type: "text", label: "Phone" },
    "address.city": { type: "text", label: "City" },
    "address.state": { type: "text", label: "State" },
    appUserRole: {
        type: "multi-select",
        label: "Role",
        options: [
            { value: 2, label: "Employee" },
            { value: 3, label: "Manager" },
            { value: 5, label: "Admin" },
        ],
    },
    isActive: {
        type: "multi-select",
        label: "Status",
        options: [
            { value: true, label: "Active" },
            { value: false, label: "Inactive" },
        ],
    },
};

const DEFAULT_SORT_OPTIONS = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
];

const ManageEmployeesTable = ({
    employeeData = [],
    pagination = {},
    setUpdateRecords,
}) => {
    // All hooks at the top
    const { styles } = useStyle();
    const { api } = useAPI();
    const { selectionType, handleChange } = useTableConfig();
    const { downloadCSV, downloading } = useBulkDownload();

    // State for form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    // State for view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingEmployee, setViewingEmployee] = useState(null);

    // State for search filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // State for bulk download
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Use static configs
    const filterConfig = DEFAULT_FILTER_CONFIG;
    const sortOptions = DEFAULT_SORT_OPTIONS;

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
            await api.deleteManageEmployee(employee.id || employee._id);
            message.success("Employee deleted successfully");

            if (setUpdateRecords) {
                setUpdateRecords((prev) => ({ ...prev }));
            }
        } catch (error) {
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

    // ========================================
    // BULK DOWNLOAD FUNCTIONALITY
    // ========================================

    const handleBulkDownload = () => {
        setBulkDownloadModalOpen(true);
    };

    const handleDownloadConfirm = async (limit, filename) => {
        try {
            // Format employee data for CSV export
            const formatEmployeeData = (employees) => {
                return employees.map((employee, index) => {
                    try {
                        const name = employee.name || {};
                        const address = employee.address || {};

                        const formattedEmployee = {
                            "Employee ID": employee.id || employee._id || "",
                            "First Name": name.first || "",
                            "Middle Name": name.middle || "",
                            "Last Name": name.last || "",
                            "Full Name": `${name.first || ""} ${
                                name.middle || ""
                            } ${name.last || ""}`.trim(),
                            Email: employee.email || "",
                            "Primary Phone": employee.phone1 || "",
                            "Secondary Phone": employee.phone2 || "",

                            // Role Information
                            "User Role": getRoleLabel(employee.appUserRole),
                            "Role Code": employee.appUserRole || "",
                            "Is Active": employee.isActive ? "Yes" : "No",
                            "Is Verified": employee.isVerified ? "Yes" : "No",

                            // Address Information
                            "Address Street": address.street || "",
                            "Address City": address.city || "",
                            "Address State": address.state || "",
                            "Address Pincode": address.pincode || "",
                            "Address Country": address.country || "",

                            // Personal Information
                            "Date of Birth": employee.dob
                                ? dayjs(employee.dob).format("DD/MM/YYYY")
                                : "",
                            Gender: employee.gender || "",
                            "Marital Status": employee.maritalStatus || "",
                            Nationality: employee.nationality || "",

                            // Professional Information
                            "Employee Code": employee.employeeCode || "",
                            Department: employee.department || "",
                            Designation: employee.designation || "",
                            "Joining Date": employee.joiningDate
                                ? dayjs(employee.joiningDate).format(
                                      "DD/MM/YYYY"
                                  )
                                : "",
                            "Manager ID": employee.managerId || "",
                            Salary: employee.salary || "",
                            "Employment Type": employee.employmentType || "",

                            // Contact Information
                            "Emergency Contact Name":
                                employee.emergencyContactName || "",
                            "Emergency Contact Phone":
                                employee.emergencyContactPhone || "",
                            "Emergency Contact Relation":
                                employee.emergencyContactRelation || "",

                            // Profile
                            "Profile Image URL":
                                employee.imageUrl || employee.imgUrl || "",
                            Bio: employee.bio || "",

                            // Timestamps
                            "Created At": employee.createdAt
                                ? dayjs(employee.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": employee.updatedAt
                                ? dayjs(employee.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Last Login": employee.lastLogin
                                ? dayjs(employee.lastLogin).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                        }

                        return formattedEmployee;
                    } catch (formatError) {
                        return {
                            "Employee ID":
                                employee.id || employee._id || "Unknown",
                            "Full Name":
                                `${employee.name?.first || ""} ${
                                    employee.name?.last || ""
                                }`.trim() || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Helper function to get role label
            const getRoleLabel = (roleCode) => {
                switch (roleCode) {
                    case 2:
                        return "Employee";
                    case 3:
                        return "Manager";
                    case 5:
                        return "Admin";
                    default:
                        return "Unknown";
                }
            };

            // Create fetch function for download
            const fetchEmployeesForDownload = async () => {
                const downloadLimit = limit === "all" ? -1 : limit;

                // Add role filter to get only employees, managers, and admins
                const employeeFilters = {
                    ...activeFilters,
                    appUserRole: { $in: [2, 3, 5] },
                };

                const response = await api.getManageEmployees({
                    page: 1, // Always start from page 1 for downloads
                    limit: downloadLimit,
                    sort: pagination.sort || "",
                    filters: employeeFilters,
                });

                return response;
            };

            await downloadCSV(
                fetchEmployeesForDownload,
                filename,
                formatEmployeeData,
                activeFilters,
                pagination.sort || ""
            );
        } catch (downloadError) {
            message.error(`Download failed: ${downloadError.message}`);
        } finally {
            // Always close the modal, even if there was an error
            setBulkDownloadModalOpen(false);
        }
    };

    // Memoize columns with dependencies
    const columns = useMemo(() => {
        return getManageEmployeesTableColumns({
            handleView,
            handleEdit,
            handleDelete,
        });
    }, [handleView, handleEdit, handleDelete]);

    // Prepare data source with useMemo
    const dataSource = useMemo(() => {
        if (!Array.isArray(employeeData)) return [];

        return employeeData.map((employee) => ({
            ...employee,
            key: employee.id || employee._id,
        }));
    }, [employeeData]);

    // Create a stable table props object
    const tableProps = useMemo(() => {
        return {
            className: styles.customTable,
            size: "middle",
            scroll: { x: "max-content" },
            columns,
            dataSource,
            onChange: handleChange,
            pagination: getPaginationConfig({
                pagination,
                onChangePagination,
            }),
        };
    }, [
        styles.customTable,

        columns,
        dataSource,
        handleChange,
        pagination,
        onChangePagination,
    ]);

    return (
        <>
            <ManageEmployeesTableToolbar
                onBulkDownload={handleBulkDownload}
                selectedCount={selectedRowKeys.length}
                onCreateNew={openDrawerForCreate}
                onSearch={() => setSearchFilterDrawerOpen(true)}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table {...tableProps} />

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
                filterConfig={filterConfig}
                sortOptions={sortOptions}
                onApplyFilters={handleApplyFilters}
                initialValues={{ ...activeFilters, sort: pagination.sort }}
            />

            {/* Enhanced Bulk download modal */}
            <BulkDownloadModal
                open={bulkDownloadModalOpen}
                onClose={() => {
                    setBulkDownloadModalOpen(false);
                }}
                onDownload={handleDownloadConfirm}
                loading={downloading}
                entityName="Employees"
            />
        </>
    );
};

export default ManageEmployeesTable;
