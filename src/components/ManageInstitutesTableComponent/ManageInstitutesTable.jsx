import React, { useState, useEffect, useMemo } from "react";
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

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

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

const ManageInstitutesTable = ({
    instituteData = [],
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
    const [editingInstitute, setEditingInstitute] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingInstitute, setViewingInstitute] = useState(null);

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
        setEditingInstitute(null);
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
            setViewingInstitute(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingInstitute(record);
            setFormDrawerOpen(true);
        }
    };

    const localHandleDelete = async (record) => {
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
                message.error("Failed to delete institute");
            }
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingInstitute(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingInstitute(null);
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
            // Format institute data for CSV export
            const formatInstituteData = (institutes) => {
                return institutes.map((institute, index) => {
                    try {
                        const location = institute.location || {};

                        const formattedInstitute = {
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
                            "Logo URL": institute.imageUrl,
                            "Establishment Year":
                                institute.establishmentYear || "",
                            Affiliation: institute.affiliation || "",
                            Accreditation: institute.accreditation || "",
                            "Institute Category": institute.category || "",
                            "Student Capacity": institute.studentCapacity || "",
                            "Faculty Count": institute.facultyCount || "",

                            // Academic Information
                            "Academic Calendar":
                                institute.academicCalendar || "",
                            "Courses Offered": institute.coursesOffered
                                ? institute.coursesOffered.join(", ")
                                : "",
                            "Admission Process":
                                institute.admissionProcess || "",
                            "Fee Structure": institute.feeStructure || "",

                            // Rankings and Recognition
                            "NIRF Ranking": institute.nirfRanking || "",
                            "International Ranking":
                                institute.internationalRanking || "",
                            Awards: institute.awards
                                ? institute.awards.join(", ")
                                : "",

                            // Facilities
                            Facilities: institute.facilities
                                ? institute.facilities.join(", ")
                                : "",
                            "Library Details": institute.libraryDetails || "",
                            "Lab Details": institute.labDetails || "",
                            "Hostel Facility": institute.hostelFacility
                                ? "Yes"
                                : "No",
                            "Sports Facility": institute.sportsFacility
                                ? "Yes"
                                : "No",

                            // Social Media and Links
                            "LinkedIn URL": institute.linkedinUrl || "",
                            "Facebook URL": institute.facebookUrl || "",
                            "Twitter URL": institute.twitterUrl || "",
                            "Instagram URL": institute.instagramUrl || "",
                            "YouTube URL": institute.youtubeUrl || "",

                            // Timestamps
                            "Created At": institute.createdAt
                                ? moment(institute.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": institute.updatedAt
                                ? moment(institute.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                        }

                        return formattedInstitute;
                    } catch (formatError) {
                        return {
                            "Institute ID":
                                institute.id || institute._id || "Unknown",
                            "Institute Name": institute.title || "Unknown",
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
            const fetchInstitutesForDownload = async () => {
                const downloadLimit = limit === "all" ? -1 : limit;

                // Ensure type=1 for institutes
                const instituteFilters = { ...activeFilters, type: 1 };

                const response = await api.getInstitutes({
                    page: 1, // Always start from page 1 for downloads
                    limit: downloadLimit,
                    sort: pagination.sort || "",
                    filters: instituteFilters,
                });

                return response;
            };

            await downloadCSV(
                fetchInstitutesForDownload,
                filename,
                formatInstituteData,
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
        return getManageInstitutesTableColumns({
            handleView: can("institutes", "view") ? localHandleView : null,
            handleEdit: can("institutes", "edit") ? localHandleEdit : null,
            handleDelete: can("institutes", "delete")
                ? localHandleDelete
                : null,
        });
    }, [can, localHandleView, localHandleEdit, localHandleDelete]);

    // Prepare data source with useMemo
    const dataSource = useMemo(() => {
        if (!Array.isArray(instituteData)) return [];

        return instituteData.map((institute) => ({
            ...institute,
            key: institute.id || institute._id,
        }));
    }, [instituteData]);

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

            {/* Enhanced Bulk download modal */}
            <BulkDownloadModal
                open={bulkDownloadModalOpen}
                onClose={() => {
                    setBulkDownloadModalOpen(false);
                }}
                onDownload={handleDownloadConfirm}
                loading={downloading}
                entityName="Institutes"
            />
        </>
    );
};

export default ManageInstitutesTable;
