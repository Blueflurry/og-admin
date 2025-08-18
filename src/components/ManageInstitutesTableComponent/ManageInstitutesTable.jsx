import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, message, Modal } from "antd";
import { createStyles } from "antd-style";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// Import separated components and utilities
import ManageInstitutesTableToolbar from "./ManageInstitutesTableToolbar";
import getManageInstitutesTableColumns from "./ManageInstitutesTableColumns";
import ManageInstitutesFormDrawer from "./ManageInstitutesFormDrawer";
import ManageInstitutesViewDrawer from "./ManageInstitutesViewDrawer";
import ManageInstitutesSearchFilterDrawer from "./ManageInstitutesSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ManageInstitutesTableConfig";
import { useAPI } from "../../hooks/useAPI";
import { useUserPermission } from "../../hooks/useUserPermission";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

// Create styles hook outside component to avoid calling hooks inside other hooks
const useComponentStyles = createStyles(({ css, token }) =>
    tableStyles(css, token)
);

// Define static configs outside component
const DEFAULT_FILTER_CONFIG = {
    title: { type: "text", label: "Institute Name" },
    description: { type: "text", label: "Description" },
    "location.city": { type: "text", label: "City" },
    "location.state": { type: "text", label: "State" },
    "location.country": { type: "text", label: "Country" },
    status: {
        type: "multi-select",
        label: "Status",
        options: [
            { value: 1, label: "Active" },
            { value: 0, label: "Inactive" },
            { value: -1, label: "Disabled" },
        ],
    },
};

const DEFAULT_SORT_OPTIONS = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
];

// Helper function moved outside component
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

// Format institute data function outside component
const formatInstituteDataForCSV = (institutes) => {
    return institutes.map((institute, index) => {
        try {
            const location = institute.location || {};

            return {
                "Institute ID": institute.id || institute._id || "",
                "Institute Name": institute.title || "",
                Description: institute.description || "",
                Type: institute.type || "",
                Status: getStatusLabel(institute.status),

                // Contact Information
                Email: institute.email || "",
                Phone: institute.phone || "",
                Website: institute.website || "",

                // Location Information
                "Address Street": location.street || "",
                "Address City": location.city || "",
                "Address State": location.state || "",
                "Address Pincode": location.pincode || "",
                "Address Country": location.country || "",
                "Full Address": institute.fullAddress || "",

                // Additional Information
                "Logo URL": institute.imageUrl || "",
                "Establishment Year": institute.establishmentYear || "",
                Affiliation: institute.affiliation || "",
                Accreditation: institute.accreditation || "",
                "Institute Category": institute.category || "",
                "Student Capacity": institute.studentCapacity || "",
                "Faculty Count": institute.facultyCount || "",

                // Academic Information
                "Academic Calendar": institute.academicCalendar || "",
                "Courses Offered": institute.coursesOffered
                    ? institute.coursesOffered.join(", ")
                    : "",
                "Admission Process": institute.admissionProcess || "",
                "Fee Structure": institute.feeStructure || "",

                // Rankings and Recognition
                "NIRF Ranking": institute.nirfRanking || "",
                "International Ranking": institute.internationalRanking || "",
                Awards: institute.awards ? institute.awards.join(", ") : "",

                // Facilities
                Facilities: institute.facilities
                    ? institute.facilities.join(", ")
                    : "",
                "Library Details": institute.libraryDetails || "",
                "Lab Details": institute.labDetails || "",
                "Hostel Facility": institute.hostelFacility ? "Yes" : "No",
                "Sports Facility": institute.sportsFacility ? "Yes" : "No",

                // Social Media and Links
                "LinkedIn URL": institute.linkedinUrl || "",
                "Facebook URL": institute.facebookUrl || "",
                "Twitter URL": institute.twitterUrl || "",
                "Instagram URL": institute.instagramUrl || "",
                "YouTube URL": institute.youtubeUrl || "",

                // Timestamps
                "Created At": institute.createdAt
                    ? moment(institute.createdAt).format("DD/MM/YYYY HH:mm")
                    : "",
                "Updated At": institute.updatedAt
                    ? moment(institute.updatedAt).format("DD/MM/YYYY HH:mm")
                    : "",
            };
        } catch (formatError) {
            console.error("Error formatting institute data:", formatError);
            return {
                "Institute ID": institute.id || institute._id || "Unknown",
                "Institute Name": institute.title || "Unknown",
                Status: "Error formatting",
            };
        }
    });
};

const ManageInstitutesTable = ({
    instituteData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    ...props
}) => {
    // All hooks must be at the top level - no conditional hooks
    const { styles } = useComponentStyles();
    const { api } = useAPI();
    const { can } = useUserPermission();
    const { selectionType, handleChange, clearFilters } = useTableConfig();
    const { downloadCSV, downloading } = useBulkDownload();

    // State hooks - all at the top
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingInstitute, setEditingInstitute] = useState(null);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingInstitute, setViewingInstitute] = useState(null);
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Static configs
    const filterConfig = DEFAULT_FILTER_CONFIG;
    const sortOptions = DEFAULT_SORT_OPTIONS;

    // Handler functions with useCallback
    const openDrawerForCreate = useCallback(() => {
        setEditingInstitute(null);
        setFormDrawerOpen(true);
    }, []);

    const openSearchFilterDrawer = useCallback(() => {
        setSearchFilterDrawerOpen(true);
    }, []);

    const closeSearchFilterDrawer = useCallback(() => {
        setSearchFilterDrawerOpen(false);
    }, []);

    const handleApplyFilters = useCallback(
        (filters) => {
            // Extract sort value if present
            const sortValue = filters.sort || "";
            const filtersWithoutSort = { ...filters };
            delete filtersWithoutSort.sort;

            // Save applied filters for future reference
            setActiveFilters(filtersWithoutSort);

            // Update records with new filters and trigger data fetch
            if (setUpdateRecords) {
                setUpdateRecords({
                    page: 1, // Reset to first page when filters change
                    limit: pagination.pageSize || pagination.limit || 10,
                    sort: sortValue,
                    filters: filtersWithoutSort,
                });
            }

            message.success("Filters applied successfully");
        },
        [setUpdateRecords, pagination.pageSize, pagination.limit]
    );

    // Fixed pagination handler
    const onChangePagination = useCallback(
        (page, pageSize) => {
            if (setUpdateRecords) {
                setUpdateRecords({
                    page: page,
                    limit: pageSize,
                    sort: pagination.sort || "",
                    filters: activeFilters,
                });
            }
        },
        [setUpdateRecords, pagination.sort, activeFilters]
    );

    const localHandleView = useCallback(
        (record) => {
            if (handleView) {
                handleView(record);
            } else {
                setViewingInstitute(record);
                setViewDrawerOpen(true);
            }
        },
        [handleView]
    );

    const localHandleEdit = useCallback(
        (record) => {
            if (handleEdit) {
                handleEdit(record);
            } else {
                setEditingInstitute(record);
                setFormDrawerOpen(true);
            }
        },
        [handleEdit]
    );

    const localHandleDelete = useCallback(
        async (record) => {
            if (handleDelete) {
                handleDelete(record);
            } else {
                try {
                    await api.deleteInstitute(record.id || record._id);
                    message.success("Institute deleted successfully");

                    // Refresh data
                    if (setUpdateRecords) {
                        setUpdateRecords((prev) => ({ ...prev }));
                    }
                } catch (error) {
                    console.error("Delete error:", error);
                    message.error("Failed to delete institute");
                }
            }
        },
        [handleDelete, api, setUpdateRecords]
    );

    const closeFormDrawer = useCallback(() => {
        setFormDrawerOpen(false);
        setEditingInstitute(null);
    }, []);

    const closeViewDrawer = useCallback(() => {
        setViewDrawerOpen(false);
        setViewingInstitute(null);
    }, []);

    const handleFormSuccess = useCallback(() => {
        if (setUpdateRecords) {
            setUpdateRecords((prev) => ({ ...prev }));
        }
    }, [setUpdateRecords]);

    const handleBulkDownload = useCallback(() => {
        setBulkDownloadModalOpen(true);
    }, []);

    const handleDownloadConfirm = useCallback(
        async (limit, filename) => {
            try {
                // Create fetch function for download
                const fetchInstitutesForDownload = async () => {
                    const downloadLimit = limit === "all" ? -1 : limit;
                    const instituteFilters = { ...activeFilters, type: 1 };

                    const response = await api.getInstitutes({
                        page: 1,
                        limit: downloadLimit,
                        sort: pagination.sort || "",
                        filters: instituteFilters,
                    });

                    return response;
                };

                await downloadCSV(
                    fetchInstitutesForDownload,
                    filename,
                    formatInstituteDataForCSV,
                    activeFilters,
                    pagination.sort || ""
                );
            } catch (downloadError) {
                console.error("Download error:", downloadError);
                message.error(`Download failed: ${downloadError.message}`);
            } finally {
                setBulkDownloadModalOpen(false);
            }
        },
        [activeFilters, pagination.sort, api, downloadCSV]
    );

    // Get user permissions - moved outside of useMemo to avoid calling hooks inside hooks
    const canView = can("institutes", "view");
    const canEdit = can("institutes", "edit");
    const canDelete = can("institutes", "delete");

    // Memoize columns with stable dependencies
    const columns = useMemo(() => {
        return getManageInstitutesTableColumns({
            handleView: canView ? localHandleView : null,
            handleEdit: canEdit ? localHandleEdit : null,
            handleDelete: canDelete ? localHandleDelete : null,
        });
    }, [
        canView,
        canEdit,
        canDelete,
        localHandleView,
        localHandleEdit,
        localHandleDelete,
    ]);

    // Prepare data source
    const dataSource = useMemo(() => {
        if (!Array.isArray(instituteData)) return [];

        return instituteData.map((institute) => ({
            ...institute,
            key: institute.id || institute._id,
        }));
    }, [instituteData]);

    // Create pagination configuration
    const paginationConfig = useMemo(() => {
        return getPaginationConfig({
            pagination: {
                current: pagination.current || pagination.page || 1,
                pageSize: pagination.pageSize || pagination.limit || 10,
                total: pagination.total || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                pageSizeOptions: ["10", "20", "50", "100"],
            },
            onChangePagination,
        });
    }, [pagination, onChangePagination]);

    // Table configuration
    const tableProps = useMemo(() => {
        return {
            className: styles.customTable,
            size: "middle",
            scroll: { x: "max-content" },
            columns,
            dataSource,
            onChange: (pag, filters, sorter, extra) => {
                // Handle table change events
                if (extra.action === "paginate") {
                    onChangePagination(pag.current, pag.pageSize);
                } else if (handleChange) {
                    handleChange(pag, filters, sorter, extra);
                }
            },
            pagination: paginationConfig,
            loading: props.loading || false,
        };
    }, [
        styles.customTable,
        columns,
        dataSource,
        paginationConfig,
        onChangePagination,
        handleChange,
        props.loading,
    ]);

    return (
        <>
            <ManageInstitutesTableToolbar
                onBulkDownload={handleBulkDownload}
                selectedCount={selectedRowKeys.length}
                onCreateNew={openDrawerForCreate}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table {...tableProps} />

            {/* Form drawer for create/edit */}
            <ManageInstitutesFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingInstitute}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <ManageInstitutesViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                instituteData={viewingInstitute}
            />

            {/* Search and filter drawer */}
            <ManageInstitutesSearchFilterDrawer
                open={searchFilterDrawerOpen}
                onClose={closeSearchFilterDrawer}
                filterConfig={filterConfig}
                sortOptions={sortOptions}
                onApplyFilters={handleApplyFilters}
                initialValues={{ ...activeFilters, sort: pagination.sort }}
            />

            {/* Bulk download modal */}
            <BulkDownloadModal
                open={bulkDownloadModalOpen}
                onClose={() => setBulkDownloadModalOpen(false)}
                onDownload={handleDownloadConfirm}
                loading={downloading}
                entityName="Institutes"
            />
        </>
    );
};

export default ManageInstitutesTable;
