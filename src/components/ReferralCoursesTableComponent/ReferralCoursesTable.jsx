import React, { useState } from "react";
import { Table, message } from "antd";
import { useUserPermission } from "../../hooks/useUserPermission";
import getReferralCoursesTableColumns from "./ReferralCoursesTableColumns";
import ReferralCoursesTableConfig from "./ReferralCoursesTableConfig";
import ReferralCoursesTableToolbar from "./ReferralCoursesTableToolbar";
import BulkDownloadModal from "../common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import { useAPI } from "../../hooks/useAPI";
import moment from "moment";

const ReferralCoursesTable = ({
    referralCourseData,
    pagination,
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    onCreateNew,
    onOpenSearch,
}) => {
    const { can } = useUserPermission();
    const { api } = useAPI();
    const { downloadCSV, downloading } = useBulkDownload();
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // Handle table change (pagination, sorting, filtering)
    const handleTableChange = (pagination, filters, sorter) => {
        const { current, pageSize } = pagination;
        const { field, order } = sorter;

        let sort = "-createdAt"; // default sort
        if (field && order) {
            sort = order === "ascend" ? field : `-${field}`;
        }

        setUpdateRecords((prev) => ({
            ...prev,
            page: current,
            limit: pageSize,
            sort,
        }));
    };

    // Search and filter is handled by parent via drawer

    // Handle bulk download
    const handleBulkDownload = () => {
        setBulkDownloadModalOpen(true);
    };

    const handleDownloadConfirm = async (limit, filename) => {
        try {
            // Format referral course data for CSV export
            const formatReferralCourseData = (referralCourses) => {
                return referralCourses.map((referralCourse, index) => {
                    try {
                        const formattedReferralCourse = {
                            "Referral Course ID":
                                referralCourse.id || referralCourse._id || "",
                            "Course Name": referralCourse.title || "",
                            "University Name": referralCourse.description || "",
                            "Created At": referralCourse.createdAt
                                ? moment(referralCourse.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": referralCourse.updatedAt
                                ? moment(referralCourse.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        return formattedReferralCourse;
                    } catch (formatError) {
                        // Return a basic format to prevent the whole process from failing
                        return {
                            "Referral Course ID":
                                referralCourse.id ||
                                referralCourse._id ||
                                "Unknown",
                            "Course Name": referralCourse.title || "Unknown",
                            "University Name":
                                referralCourse.description || "Unknown",
                        };
                    }
                });
            };

            // Create fetch function for download
            const fetchReferralCoursesForDownload = async () => {
                const downloadLimit = limit === "all" ? -1 : limit;

                const response = await api.getReferralCourses(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    pagination.sort || "",
                    activeFilters
                );

                return response;
            };

            await downloadCSV(
                fetchReferralCoursesForDownload,
                filename,
                formatReferralCourseData,
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

    // Get table columns
    const columns = getReferralCoursesTableColumns({
        handleView,
        handleEdit,
        handleDelete,
        can,
    });

    return (
        <div>
            <ReferralCoursesTableToolbar
                onBulkDownload={handleBulkDownload}
                onCreateNew={onCreateNew}
                onSearch={onOpenSearch}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table
                {...ReferralCoursesTableConfig}
                columns={columns}
                dataSource={referralCourseData}
                pagination={{
                    ...ReferralCoursesTableConfig.pagination,
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.totalDocs,
                }}
                onChange={handleTableChange}
                loading={false}
            />

            {/* Bulk download modal */}
            <BulkDownloadModal
                open={bulkDownloadModalOpen}
                onClose={() => {
                    setBulkDownloadModalOpen(false);
                }}
                onDownload={handleDownloadConfirm}
                loading={downloading}
                entityName="Referral Courses"
            />
        </div>
    );
};

export default ReferralCoursesTable;
