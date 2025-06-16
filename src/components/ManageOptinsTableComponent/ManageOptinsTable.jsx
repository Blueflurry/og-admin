import React, { useState, useEffect, useMemo } from "react";
import { Table, message, Modal } from "antd";
import { createStyles } from "antd-style";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// Import separated components and utilities
import ManageOptinsTableToolbar from "./ManageOptinsTableToolbar";
import getManageOptinsTableColumns from "./ManageOptinsTableColumns";
import ManageOptinsFormDrawer from "./ManageOptinsFormDrawer";
import ManageOptinsViewDrawer from "./ManageOptinsViewDrawer";
import ManageOptinsSearchFilterDrawer from "./ManageOptinsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ManageOptinsTableConfig";
import { useAPI } from "../../hooks/useAPI";
import { useUserPermission } from "../../hooks/useUserPermission";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

// Define static configs outside component
const DEFAULT_FILTER_CONFIG = {
    title: { type: "text", label: "Optin Title" },
    description: { type: "text", label: "Description" },
    category: { type: "text", label: "Category" },
    status: {
        type: "multi-select",
        label: "Status",
        options: [
            { value: 1, label: "Active" },
            { value: 0, label: "Inactive" },
            { value: -1, label: "Disabled" },
        ],
    },
    isRequired: {
        type: "multi-select",
        label: "Required",
        options: [
            { value: true, label: "Required" },
            { value: false, label: "Optional" },
        ],
    },
};

const DEFAULT_SORT_OPTIONS = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
    { label: "Optin Title A-Z", value: "title" },
    { label: "Optin Title Z-A", value: "-title" },
];

const ManageOptinsTable = ({
    optinData = [],
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
    const [editingOptin, setEditingOptin] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingOptin, setViewingOptin] = useState(null);

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
        setEditingOptin(null);
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
            setViewingOptin(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingOptin(record);
            setFormDrawerOpen(true);
        }
    };

    const localHandleDelete = async (record) => {
        if (handleDelete) {
            handleDelete(record);
        } else {
            try {
                await api.deleteManageOptin(record.id || record._id);
                message.success("Optin deleted successfully");

                // Refresh data
                if (setUpdateRecords) {
                    setUpdateRecords((prev) => ({ ...prev }));
                }
            } catch (error) {
                console.error("Error deleting optin:", error);
                message.error("Failed to delete optin");
            }
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingOptin(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingOptin(null);
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
        console.log("🔄 Opening bulk download modal");
        setBulkDownloadModalOpen(true);
    };

    const handleDownloadConfirm = async (limit, filename) => {
        console.log(
            "🔄 Download confirmed with limit:",
            limit,
            "filename:",
            filename
        );

        try {
            // Format optin data for CSV export
            const formatOptinData = (optins) => {
                console.log("🔄 Formatting", optins.length, "optins for CSV");

                return optins.map((optin, index) => {
                    try {
                        const formattedOptin = {
                            "Optin ID": optin.id || optin._id || "",
                            "Optin Title": optin.title || "",
                            Description: optin.description || "",
                            Type: optin.type || "",
                            Status: getStatusLabel(optin.status),
                            Category: optin.category || "",

                            // Optin Configuration
                            "Is Required": optin.isRequired ? "Yes" : "No",
                            "Default Value": optin.defaultValue || "",
                            "Display Order": optin.displayOrder || "",
                            "Is Visible": optin.isVisible ? "Yes" : "No",

                            // Consent Information
                            "Consent Type": optin.consentType || "",
                            "Legal Basis": optin.legalBasis || "",
                            "Consent Text": optin.consentText || "",
                            "Privacy Policy URL": optin.privacyPolicyUrl || "",
                            "Terms of Service URL":
                                optin.termsOfServiceUrl || "",

                            // Marketing Information
                            "Marketing Category": optin.marketingCategory || "",
                            "Communication Method":
                                optin.communicationMethod || "",
                            Frequency: optin.frequency || "",

                            // Opt-in/Opt-out Settings
                            "Allow Opt-out": optin.allowOptOut ? "Yes" : "No",
                            "Opt-out Method": optin.optOutMethod || "",
                            "Double Opt-in Required": optin.doubleOptInRequired
                                ? "Yes"
                                : "No",
                            "Confirmation Email Template":
                                optin.confirmationEmailTemplate || "",

                            // Tracking Information
                            "Track Consent": optin.trackConsent ? "Yes" : "No",
                            "Consent Timestamp Required":
                                optin.consentTimestampRequired ? "Yes" : "No",
                            "IP Address Required": optin.ipAddressRequired
                                ? "Yes"
                                : "No",

                            // Compliance Information
                            "GDPR Compliant": optin.gdprCompliant
                                ? "Yes"
                                : "No",
                            "CCPA Compliant": optin.ccpaCompliant
                                ? "Yes"
                                : "No",
                            "CAN-SPAM Compliant": optin.canSpamCompliant
                                ? "Yes"
                                : "No",

                            // Form Configuration
                            "Form Field Type": optin.formFieldType || "",
                            "Form Field Label": optin.formFieldLabel || "",
                            "Form Field Placeholder":
                                optin.formFieldPlaceholder || "",
                            "Validation Rules": optin.validationRules
                                ? JSON.stringify(optin.validationRules)
                                : "",

                            // Analytics
                            "Total Subscribers": optin.totalSubscribers || "",
                            "Active Subscribers": optin.activeSubscribers || "",
                            "Opt-out Count": optin.optOutCount || "",
                            "Conversion Rate": optin.conversionRate || "",

                            // Targeting
                            "Target Audience": optin.targetAudience || "",
                            "Geographic Restrictions":
                                optin.geographicRestrictions
                                    ? optin.geographicRestrictions.join(", ")
                                    : "",
                            "Age Restrictions": optin.ageRestrictions || "",

                            // Integration
                            "External System ID": optin.externalSystemId || "",
                            "CRM Integration": optin.crmIntegration
                                ? "Yes"
                                : "No",
                            "Email Platform Integration":
                                optin.emailPlatformIntegration || "",

                            // Timestamps
                            "Created At": optin.createdAt
                                ? moment(optin.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": optin.updatedAt
                                ? moment(optin.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Last Used": optin.lastUsed
                                ? moment(optin.lastUsed).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                            console.log(
                                "📄 Sample formatted optin:",
                                formattedOptin
                            );
                        }

                        return formattedOptin;
                    } catch (formatError) {
                        console.error(
                            "❌ Error formatting optin at index",
                            index,
                            ":",
                            formatError
                        );
                        return {
                            "Optin ID": optin.id || optin._id || "Unknown",
                            "Optin Title": optin.title || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Helper function to get status label
            const getStatusLabel = (status) => {
                switch (status) {
                    case 1:
                        return "Active";
                    case 0:
                        return "Inactive";
                    case -1:
                        return "Disabled";
                    default:
                        return "Unknown";
                }
            };

            // Create fetch function for download
            const fetchOptinsForDownload = async () => {
                console.log("📡 Fetching optins for download...");
                const downloadLimit = limit === "all" ? 999999 : limit;

                // Ensure type=0 for optins
                const optinFilters = { ...activeFilters, type: 0 };

                const response = await api.getManageOptins({
                    page: 1, // Always start from page 1 for downloads
                    limit: downloadLimit,
                    sort: pagination.sort || "",
                    filters: optinFilters,
                });

                console.log("📡 Fetch response for download:", response);
                return response;
            };

            console.log("🔄 Starting CSV download with filename:", filename);

            await downloadCSV(
                fetchOptinsForDownload,
                filename,
                formatOptinData,
                activeFilters,
                pagination.sort || ""
            );

            console.log("✅ Download process completed");
        } catch (downloadError) {
            console.error("❌ Error in handleDownloadConfirm:", downloadError);
            message.error(`Download failed: ${downloadError.message}`);
        } finally {
            // Always close the modal, even if there was an error
            console.log("🔄 Closing download modal");
            setBulkDownloadModalOpen(false);
        }
    };

    // Memoize columns with dependencies
    const columns = useMemo(() => {
        return getManageOptinsTableColumns({
            handleView: can("optins", "view") ? localHandleView : null,
            handleEdit: can("optins", "edit") ? localHandleEdit : null,
            handleDelete: can("optins", "delete") ? localHandleDelete : null,
        });
    }, [can, localHandleView, localHandleEdit, localHandleDelete]);

    // Prepare data source with useMemo
    const dataSource = useMemo(() => {
        if (!Array.isArray(optinData)) return [];

        return optinData.map((optin) => ({
            ...optin,
            key: optin.id || optin._id,
        }));
    }, [optinData]);

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
            <ManageOptinsTableToolbar
                onBulkDownload={handleBulkDownload}
                selectedCount={selectedRowKeys.length}
                onCreateNew={openDrawerForCreate}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table {...tableProps} />

            {/* Form drawer for create/edit */}
            <ManageOptinsFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingOptin}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <ManageOptinsViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                optinData={viewingOptin}
            />

            {/* Search and filter drawer */}
            <ManageOptinsSearchFilterDrawer
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
                    console.log("🔄 Manual close of download modal");
                    setBulkDownloadModalOpen(false);
                }}
                onDownload={handleDownloadConfirm}
                loading={downloading}
                entityName="Optins"
            />
        </>
    );
};

export default ManageOptinsTable;
