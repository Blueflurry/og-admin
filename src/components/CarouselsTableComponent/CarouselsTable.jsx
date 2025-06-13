import React, { useState, useEffect, useMemo } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import CarouselsTableToolbar from "./CarouselsTableToolbar";
import getCarouselsTableColumns from "./CarouselsTableColumns";
import CarouselsFormDrawer from "./CarouselsFormDrawer";
import CarouselsViewDrawer from "./CarouselsViewDrawer";
import CarouselsSearchFilterDrawer from "./CarouselsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./CarouselsTableConfig";
import { useAPI } from "../../hooks/useAPI";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

// Define static configs outside component
const DEFAULT_FILTER_CONFIG = {
    title: { type: "text", label: "Title" },
    description: { type: "text", label: "Description" },
    link: { type: "text", label: "Link" },
};

const DEFAULT_SORT_OPTIONS = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
];

const CarouselsTable = ({
    carouselData = [],
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
    const { selectionType, handleChange, clearFilters } = useTableConfig();
    const { downloadCSV, downloading } = useBulkDownload();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingCarousel, setEditingCarousel] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingCarousel, setViewingCarousel] = useState(null);

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
        setEditingCarousel(null);
        setFormDrawerOpen(true);
    };

    const openSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(true);
    };

    const closeSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(false);
    };

    // Helper function to remove empty filters
    const cleanEmptyFilters = (filters) => {
        const cleanedFilters = {};

        Object.entries(filters).forEach(([key, value]) => {
            // Skip if value is null, undefined, or empty string
            if (value === null || value === undefined || value === "") {
                return;
            }

            // Skip if value is an empty array
            if (Array.isArray(value) && value.length === 0) {
                return;
            }

            // Skip if value is an empty object
            if (
                typeof value === "object" &&
                !Array.isArray(value) &&
                Object.keys(value).length === 0
            ) {
                return;
            }

            // For objects (like MongoDB operators), check if they have meaningful values
            if (typeof value === "object" && !Array.isArray(value)) {
                const cleanedObject = {};
                let hasValidValues = false;

                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (
                        subValue !== null &&
                        subValue !== undefined &&
                        subValue !== ""
                    ) {
                        if (Array.isArray(subValue) && subValue.length > 0) {
                            cleanedObject[subKey] = subValue;
                            hasValidValues = true;
                        } else if (!Array.isArray(subValue)) {
                            cleanedObject[subKey] = subValue;
                            hasValidValues = true;
                        }
                    }
                });

                if (hasValidValues) {
                    cleanedFilters[key] = cleanedObject;
                }
            } else {
                // Add non-empty primitive values and non-empty arrays
                cleanedFilters[key] = value;
            }
        });

        return cleanedFilters;
    };

    const handleApplyFilters = (filters) => {
        // Extract sort value if present
        const sortValue = filters.sort || "";
        delete filters.sort;

        // Clean empty filters
        const cleanedFilters = cleanEmptyFilters(filters);

        // Save applied filters for future reference
        setActiveFilters(cleanedFilters);

        // Update records with new filters and trigger data fetch
        if (setUpdateRecords) {
            setUpdateRecords({
                page: 1, // Reset to first page when filters change
                limit: pagination.limit || 10,
                sort: sortValue,
                filters: cleanedFilters,
            });
        }

        // Show success message only if filters were applied
        const filterCount = Object.keys(cleanedFilters).length;
        if (filterCount > 0) {
            message.success(`${filterCount} filter(s) applied successfully`);
        } else {
            message.info("All filters cleared");
        }
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
            setViewingCarousel(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingCarousel(record);
            setFormDrawerOpen(true);
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingCarousel(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingCarousel(null);
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
            // Format carousel data for CSV export
            const formatCarouselData = (carousels) => {
                console.log(
                    "🔄 Formatting",
                    carousels.length,
                    "carousels for CSV"
                );

                return carousels.map((carousel, index) => {
                    try {
                        const formattedCarousel = {
                            "Carousel ID": carousel.id || carousel._id || "",
                            Title: carousel.title || "",
                            Description: carousel.description || "",
                            Link: carousel.link || "",
                            "Image URL": carousel.imageUrl,
                            "Display Order": carousel.order || "",
                            Status: getStatusLabel(carousel.status),
                            Type: carousel.type || "",
                            "Target Audience": carousel.targetAudience || "",
                            "Animation Type": carousel.animationType || "",
                            "Display Duration (ms)":
                                carousel.displayDuration || "",
                            Placement: carousel.placement || "",
                            "Background Color": carousel.backgroundColor || "",
                            "Text Color": carousel.textColor || "",
                            "Overlay Opacity": carousel.overlayOpacity || "",
                            "Button Text": carousel.buttonText || "",
                            "Click Count": carousel.clickCount || "",
                            Impressions: carousel.impressions || "",
                            "CTR (%)":
                                carousel.clickCount && carousel.impressions
                                    ? (
                                          (carousel.clickCount /
                                              carousel.impressions) *
                                          100
                                      ).toFixed(2)
                                    : "",
                            "Start Date": carousel.startDate
                                ? moment(carousel.startDate).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "End Date": carousel.endDate
                                ? moment(carousel.endDate).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Created At": carousel.createdAt
                                ? moment(carousel.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": carousel.updatedAt
                                ? moment(carousel.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                            console.log(
                                "📄 Sample formatted carousel:",
                                formattedCarousel
                            );
                        }

                        return formattedCarousel;
                    } catch (formatError) {
                        console.error(
                            "❌ Error formatting carousel at index",
                            index,
                            ":",
                            formatError
                        );
                        return {
                            "Carousel ID":
                                carousel.id || carousel._id || "Unknown",
                            Title: carousel.title || "Unknown",
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
            const fetchCarouselsForDownload = async () => {
                console.log("📡 Fetching carousels for download...");
                const downloadLimit = limit === "all" ? 999999 : limit;

                const response = await api.getCarousels(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    pagination.sort || "",
                    { ...activeFilters, type: 2 } // Ensure type=2 for carousels
                );

                console.log("📡 Fetch response for download:", response);
                return response;
            };

            console.log("🔄 Starting CSV download with filename:", filename);

            await downloadCSV(
                fetchCarouselsForDownload,
                filename,
                formatCarouselData,
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
        return getCarouselsTableColumns({
            handleView: localHandleView,
            handleEdit: localHandleEdit,
            handleDelete,
        });
    }, [localHandleView, localHandleEdit, handleDelete]);

    // Prepare data source with useMemo
    const dataSource = useMemo(() => {
        if (!Array.isArray(carouselData)) return [];

        return carouselData.map((carousel) => ({
            ...carousel,
            key: carousel.id || carousel._id,
        }));
    }, [carouselData]);

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
            <CarouselsTableToolbar
                onBulkDownload={handleBulkDownload}
                selectedCount={selectedRowKeys.length}
                onCreateNew={openDrawerForCreate}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table {...tableProps} />

            {/* Form drawer for create/edit */}
            <CarouselsFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingCarousel}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <CarouselsViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                carouselData={viewingCarousel}
            />

            {/* Search and filter drawer */}
            <CarouselsSearchFilterDrawer
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
                entityName="Carousels"
            />
        </>
    );
};

export default CarouselsTable;
