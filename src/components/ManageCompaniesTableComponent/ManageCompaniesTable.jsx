import React, { useState, useEffect, useMemo } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import ManageCompaniesTableToolbar from "./ManageCompaniesTableToolbar";
import getManageCompaniesTableColumns from "./ManageCompaniesTableColumns";
import ManageCompaniesFormDrawer from "./ManageCompaniesFormDrawer";
import ManageCompaniesViewDrawer from "./ManageCompaniesViewDrawer";
import ManageCompaniesSearchFilterDrawer from "./ManageCompaniesSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ManageCompaniesTableConfig";
import { useAPI } from "../../hooks/useAPI";
import { useUserPermission } from "../../hooks/useUserPermission";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

// Define static configs outside component
const DEFAULT_FILTER_CONFIG = {
    "data.name": { type: "text", label: "Company Name" },
    "data.email": { type: "text", label: "Company Email" },
    "data.phone": { type: "text", label: "Company Phone" },
    "data.address.city": { type: "text", label: "City" },
    "data.address.state": { type: "text", label: "State" },
    "data.address.country": { type: "text", label: "Country" },
};

const DEFAULT_SORT_OPTIONS = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
];

const ManageCompaniesTable = ({
    companyData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    ...props
}) => {
    // All hooks at the top
    const { styles } = useStyle();
    const { api } = useAPI();
    const { can } = useUserPermission();
    const { selectionType, handleChange, clearFilters } = useTableConfig();
    const { downloadCSV, downloading } = useBulkDownload();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingCompany, setViewingCompany] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // State for bulk download
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Use static configs
    const filterConfig = DEFAULT_FILTER_CONFIG;
    const sortOptions = DEFAULT_SORT_OPTIONS;

    const openDrawerForCreate = () => {
        setEditingCompany(null);
        setFormDrawerOpen(true);
    };

    const openSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(true);
    };

    const closeSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(false);
    };

    const handleApplyFilters = (filters) => {
        // Extract sort value if present
        const sortValue = filters.sort || "";
        delete filters.sort;

        // Save applied filters for future reference
        setActiveFilters(filters);

        // Update records with new filters and trigger data fetch
        if (setUpdateRecords) {
            setUpdateRecords({
                page: 1, // Reset to first page when filters change
                limit: pagination.limit || 10,
                sort: sortValue,
                filters: filters,
            });
        }

        message.success("Filters applied successfully");
    };

    const onChangePagination = (page, pageSize) => {
        // Update records with new page and limit values while preserving filters
        if (setUpdateRecords) {
            setUpdateRecords({
                page: page,
                limit: pageSize,
                sort: pagination.sort || "",
                filters: activeFilters,
            });
        }
    };

    const localHandleView = (record) => {
        if (handleView) {
            handleView(record);
        } else {
            setViewingCompany(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingCompany(record);
            setFormDrawerOpen(true);
        }
    };

    const localHandleDelete = async (record) => {
        if (handleDelete) {
            handleDelete(record);
        } else {
            try {
                await api.deleteManageCompany(record.id || record._id);
                message.success("Company deleted successfully");
                // Refresh the table data
                if (setUpdateRecords) {
                    setUpdateRecords((prev) => ({ ...prev }));
                }
            } catch (error) {
                message.error("Failed to delete company");
            }
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingCompany(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingCompany(null);
    };

    const handleFormSuccess = () => {
        // Refresh the table data
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
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
            // Format company data for CSV export
            const formatCompanyData = (companies) => {
                return companies.map((company, index) => {
                    try {
                        const companyData = company.data || {};
                        const address = companyData.address || {};

                        const formattedCompany = {
                            "Company ID": company.id || company._id || "",
                            "Company Name": companyData.name || "",
                            Description: companyData.description || "",
                            Email: companyData.email || "",
                            Phone: companyData.phone || "",
                            Website: companyData.website || "",
                            "Industry Type": companyData.industryType || "",
                            "Company Size": companyData.companySize || "",
                            "Founded Year": companyData.foundedYear || "",
                            "Logo URL": companyData.imageUrl,

                            // Address Information
                            "Address Street": address.street || "",
                            "Address City": address.city || "",
                            "Address State": address.state || "",
                            "Address Pincode": address.pincode || "",
                            "Address Country": address.country || "",
                            "Full Address": company.fullAddress || "",

                            // Social Media
                            "LinkedIn URL": companyData.linkedinUrl || "",
                            "Twitter URL": companyData.twitterUrl || "",
                            "Facebook URL": companyData.facebookUrl || "",
                            "Instagram URL": companyData.instagramUrl || "",

                            // Additional Information
                            "Employee Count": companyData.employeeCount || "",
                            "Annual Revenue": companyData.annualRevenue || "",
                            "Stock Symbol": companyData.stockSymbol || "",
                            "Is Public": companyData.isPublic ? "Yes" : "No",
                            "Is Verified": companyData.isVerified
                                ? "Yes"
                                : "No",

                            // Timestamps
                            "Created At": company.createdAt
                                ? moment(company.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": company.updatedAt
                                ? moment(company.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                        }

                        return formattedCompany;
                    } catch (formatError) {
                        return {
                            "Company ID":
                                company.id || company._id || "Unknown",
                            "Company Name": company.data?.name || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Create fetch function for download
            const fetchCompaniesForDownload = async () => {
                const downloadLimit = limit === "all" ? -1 : limit;

                const response = await api.getManageCompanies({
                    page: 1, // Always start from page 1 for downloads
                    limit: downloadLimit,
                    sort: pagination.sort || "",
                    filters: activeFilters,
                });

                return response;
            };

            await downloadCSV(
                fetchCompaniesForDownload,
                filename,
                formatCompanyData,
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
        return getManageCompaniesTableColumns({
            handleView: can("companies", "view") ? localHandleView : null,
            handleEdit: can("companies", "edit") ? localHandleEdit : null,
            handleDelete: can("companies", "delete") ? localHandleDelete : null,
            can,
        });
    }, [can, localHandleView, localHandleEdit, localHandleDelete]);

    // Prepare data source with useMemo
    const dataSource = useMemo(() => {
        if (!Array.isArray(companyData)) return [];

        return companyData.map((company) => ({
            ...company,
            key: company.id || company._id,
        }));
    }, [companyData]);

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
            <ManageCompaniesTableToolbar
                onBulkDownload={handleBulkDownload}
                selectedCount={selectedRowKeys.length}
                onCreateNew={openDrawerForCreate}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table {...tableProps} />

            {/* Form drawer for create/edit */}
            <ManageCompaniesFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingCompany}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <ManageCompaniesViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                companyData={viewingCompany}
            />

            {/* Search and filter drawer */}
            <ManageCompaniesSearchFilterDrawer
                open={searchFilterDrawerOpen}
                onClose={closeSearchFilterDrawer}
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
                entityName="Companies"
            />
        </>
    );
};

export default ManageCompaniesTable;
