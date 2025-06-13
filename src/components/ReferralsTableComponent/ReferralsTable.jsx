import React, { useState, useMemo } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

import ReferralsTableToolbar from "./ReferralsTableToolbar";
import getReferralsTableColumns from "./ReferralsTableColumns";
import ReferralsSearchFilterDrawer from "./ReferralsSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./ReferralsTableConfig";
import { useUserPermission } from "../../hooks/useUserPermission";
import { useAPI } from "../../hooks/useAPI";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

// Static configurations
const DEFAULT_FILTER_CONFIG = {
    friendName: { type: "text", label: "Friend's Name" },
    friendPhone: { type: "text", label: "Friend's Phone" },
    "data.name.first": { type: "text", label: "Referrer's First Name" },
    "data.name.last": { type: "text", label: "Referrer's Last Name" },
    "data.phone1": { type: "text", label: "Referrer's Phone" },
    "courseDetails.courseName": { type: "text", label: "Course Name" },
    "courseDetails.courseId": { type: "text", label: "Course ID" },
    status: {
        type: "multi-select",
        label: "Status",
        options: [
            { value: 0, label: "Pending" },
            { value: 1, label: "Success" },
            { value: 2, label: "Rejected" },
        ],
    },
    createdAt: { type: "date", label: "Created Date" },
};

const DEFAULT_SORT_OPTIONS = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
];

const ReferralsTable = ({
    referralData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    onCreateNew,
}) => {
    // All hooks at the top
    const { styles } = useStyle();
    const { can } = useUserPermission();
    const { api } = useAPI();
    const { selectionType, handleChange } = useTableConfig();
    const { downloadCSV, downloading } = useBulkDownload();

    // State hooks
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // State for bulk download
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Use static configs
    const filterConfig = DEFAULT_FILTER_CONFIG;
    const sortOptions = DEFAULT_SORT_OPTIONS;

    // Handler functions
    const openSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(true);
    };

    const closeSearchFilterDrawer = () => {
        setSearchFilterDrawerOpen(false);
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
            // Format referral data for CSV export
            const formatReferralData = (referrals) => {
                console.log(
                    "🔄 Formatting",
                    referrals.length,
                    "referrals for CSV"
                );

                return referrals.map((referral, index) => {
                    try {
                        const referrerData = referral.data || {};
                        const referrerName = referrerData.name || {};
                        const referrerAddress = referrerData.address || {};
                        const courseDetails = referral.courseDetails || {};

                        const formattedReferral = {
                            "Referral ID": referral.id || referral._id || "",

                            // Friend Information (the person being referred)
                            "Friend's Name": referral.friendName || "",
                            "Friend's Phone": referral.friendPhone || "",
                            "Friend's Email": referral.friendEmail || "",
                            "Friend's City": referral.friendCity || "",
                            "Friend's State": referral.friendState || "",
                            "Friend's Country": referral.friendCountry || "",

                            // Referrer Information (the person making the referral)
                            "Referrer ID": referral.user || "",
                            "Referrer First Name": referrerName.first || "",
                            "Referrer Middle Name": referrerName.middle || "",
                            "Referrer Last Name": referrerName.last || "",
                            "Referrer Full Name": `${
                                referrerName.first || ""
                            } ${referrerName.middle || ""} ${
                                referrerName.last || ""
                            }`.trim(),
                            "Referrer Email": referrerData.email || "",
                            "Referrer Phone": referrerData.phone1 || "",
                            "Referrer Secondary Phone":
                                referrerData.phone2 || "",

                            // Referrer Address
                            "Referrer Address Street":
                                referrerAddress.street || "",
                            "Referrer Address City": referrerAddress.city || "",
                            "Referrer Address State":
                                referrerAddress.state || "",
                            "Referrer Address Pincode":
                                referrerAddress.pincode || "",
                            "Referrer Address Country":
                                referrerAddress.country || "",

                            // Course Information
                            "Course ID": courseDetails.courseId || "",
                            "Course Name": courseDetails.courseName || "",
                            "Course Type": courseDetails.courseType || "",
                            "Course Category":
                                courseDetails.courseCategory || "",
                            "Course Duration":
                                courseDetails.courseDuration || "",
                            "Course Fee": courseDetails.courseFee || "",
                            "Course Start Date": courseDetails.courseStartDate
                                ? moment(courseDetails.courseStartDate).format(
                                      "DD/MM/YYYY"
                                  )
                                : "",

                            // Referral Status and Tracking
                            Status: getStatusLabel(referral.status),
                            "Status Code": referral.status,
                            "Referral Source": referral.referralSource || "",
                            "Referral Medium": referral.referralMedium || "",
                            "Referral Campaign":
                                referral.referralCampaign || "",

                            // Reward Information
                            "Reward Type": referral.rewardType || "",
                            "Reward Amount": referral.rewardAmount || "",
                            "Reward Currency": referral.rewardCurrency || "",
                            "Reward Status": referral.rewardStatus || "",
                            "Reward Given Date": referral.rewardGivenDate
                                ? moment(referral.rewardGivenDate).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",

                            // Conversion Information
                            "Is Converted": referral.isConverted ? "Yes" : "No",
                            "Conversion Date": referral.conversionDate
                                ? moment(referral.conversionDate).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Conversion Value": referral.conversionValue || "",
                            "Conversion Notes": referral.conversionNotes || "",

                            // Follow-up Information
                            "Follow-up Required": referral.followupRequired
                                ? "Yes"
                                : "No",
                            "Follow-up Date": referral.followupDate
                                ? moment(referral.followupDate).format(
                                      "DD/MM/YYYY"
                                  )
                                : "",
                            "Follow-up Notes": referral.followupNotes || "",
                            "Last Contact Date": referral.lastContactDate
                                ? moment(referral.lastContactDate).format(
                                      "DD/MM/YYYY"
                                  )
                                : "",

                            // Communication Tracking
                            "Email Sent": referral.emailSent ? "Yes" : "No",
                            "SMS Sent": referral.smsSent ? "Yes" : "No",
                            "Call Made": referral.callMade ? "Yes" : "No",
                            "WhatsApp Sent": referral.whatsappSent
                                ? "Yes"
                                : "No",

                            // Analytics
                            "Click Count": referral.clickCount || "",
                            "View Count": referral.viewCount || "",
                            "Share Count": referral.shareCount || "",

                            // Additional Information
                            Notes: referral.notes || "",
                            "Internal Notes": referral.internalNotes || "",
                            Priority: referral.priority || "",
                            "Assigned To": referral.assignedTo || "",

                            // Timestamps
                            "Created At": referral.createdAt
                                ? moment(referral.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": referral.updatedAt
                                ? moment(referral.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                            console.log(
                                "📄 Sample formatted referral:",
                                formattedReferral
                            );
                        }

                        return formattedReferral;
                    } catch (formatError) {
                        console.error(
                            "❌ Error formatting referral at index",
                            index,
                            ":",
                            formatError
                        );
                        return {
                            "Referral ID":
                                referral.id || referral._id || "Unknown",
                            "Friend's Name": referral.friendName || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Helper function to get status label
            const getStatusLabel = (status) => {
                switch (status) {
                    case 0:
                        return "Pending";
                    case 1:
                        return "Success";
                    case 2:
                        return "Rejected";
                    default:
                        return "Unknown";
                }
            };

            // Create fetch function for download
            const fetchReferralsForDownload = async () => {
                console.log("📡 Fetching referrals for download...");
                const downloadLimit = limit === "all" ? 999999 : limit;

                const response = await api.getReferrals(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    pagination.sort || "",
                    activeFilters
                );

                console.log("📡 Fetch response for download:", response);
                return response;
            };

            console.log("🔄 Starting CSV download with filename:", filename);

            await downloadCSV(
                fetchReferralsForDownload,
                filename,
                formatReferralData,
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
        return getReferralsTableColumns({
            handleView,
            handleEdit,
            handleDelete,
            can,
        });
    }, [handleView, handleEdit, handleDelete, can]);

    // Prepare data source with useMemo
    const dataSource = useMemo(() => {
        if (!Array.isArray(referralData)) return [];

        return referralData.map((referral) => ({
            ...referral,
            key: referral.id || referral._id,
        }));
    }, [referralData]);

    // Create a stable table props object
    const tableProps = useMemo(() => {
        return {
            className: styles.customTable,
            size: "middle",
            scroll: { x: "max-content" },
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
            <ReferralsTableToolbar
                onBulkDownload={handleBulkDownload}
                selectedCount={selectedRowKeys.length}
                onCreateNew={onCreateNew}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table {...tableProps} />

            <ReferralsSearchFilterDrawer
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
                entityName="Referrals"
            />
        </>
    );
};

export default ReferralsTable;
