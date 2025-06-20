import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import { createStyles } from "antd-style";

// Import separated components and utilities
import CoursesTableToolbar from "./CoursesTableToolbar";
import getCoursesTableColumns from "./CoursesTableColumns";
import CoursesFormDrawer from "./CoursesFormDrawer";
import CoursesViewDrawer from "./CoursesViewDrawer";
import CoursesSearchFilterDrawer from "./CoursesSearchFilterDrawer";
import {
    useTableConfig,
    getPaginationConfig,
    tableStyles,
} from "./CoursesTableConfig";
import { useAPI } from "../../hooks/useAPI";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

const useStyle = createStyles(({ css, token }) => tableStyles(css, token));

const CoursesTable = ({
    courseData = [],
    pagination = {},
    setUpdateRecords,
    handleView,
    handleEdit,
    handleDelete,
    ...props
}) => {
    const { styles } = useStyle();
    const { api } = useAPI();
    const { selectionType, handleChange, clearFilters } = useTableConfig();

    // State for the form drawer
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // State for the view drawer
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [viewingCourse, setViewingCourse] = useState(null);

    // State for search and filter drawer
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);

    // Bulk download hook
    const { downloadCSV, downloading } = useBulkDownload();

    // Hardcoded filter configuration since there's no config API
    const filterConfig = {
        title: { type: "text", label: "Title" },
        description: { type: "text", label: "Description" },
        startDate: { type: "date", label: "Start Date" },
        endDate: { type: "date", label: "End Date" },
        duration: { type: "number", label: "Duration (minutes)" },
        enrolled: { type: "number", label: "Enrolled Students" },
    };

    // Hardcoded sort options
    const sortOptions = [
        { label: "Newest First", value: "-createdAt" },
        { label: "Oldest First", value: "createdAt" },
    ];

    const openDrawerForCreate = () => {
        setEditingCourse(null);
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
            setViewingCourse(record);
            setViewDrawerOpen(true);
        }
    };

    const localHandleEdit = (record) => {
        if (handleEdit) {
            handleEdit(record);
        } else {
            setEditingCourse(record);
            setFormDrawerOpen(true);
        }
    };

    const closeFormDrawer = () => {
        setFormDrawerOpen(false);
        setEditingCourse(null);
    };

    const closeViewDrawer = () => {
        setViewDrawerOpen(false);
        setViewingCourse(null);
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
            // Format course data for CSV export
            const formatCourseData = (courses) => {
                console.log("🔄 Formatting", courses.length, "courses for CSV");

                return courses.map((course, index) => {
                    try {
                        const formattedCourse = {
                            "Course ID": course.id || course._id || "",
                            Title: course.title || "",
                            Description: course.description || "",
                            Status: course.status === 1 ? "Active" : "Inactive",
                            "Duration (minutes)": course.duration || "",
                            "Start Date": course.startDate
                                ? moment(course.startDate).format("DD/MM/YYYY")
                                : "",
                            "End Date": course.endDate
                                ? moment(course.endDate).format("DD/MM/YYYY")
                                : "",
                            "Start Time": course.startTime || "",
                            "End Time": course.endTime || "",
                            Instructor: course.instructor || "",
                            Category: course.category || "",
                            Level: course.level || "",
                            Prerequisites: course.prerequisites || "",
                            "Max Students": course.maxStudents || "",
                            "Enrolled Students":
                                course.enrolled || course.enrolledCount || "",
                            Price: course.price || "",
                            Currency: course.currency || "",
                            Language: course.language || "",
                            "Certificate Provided": course.certificateProvided
                                ? "Yes"
                                : "No",
                            "Materials Included": course.materialsIncluded
                                ? "Yes"
                                : "No",
                            "Online/Offline": course.mode || "",
                            Location: course.location || "",
                            "Image URL": course.imageUrl,
                            "Video URL": course.videoUrl || "",
                            "Course URL": course.courseUrl || "",
                            Tags: Array.isArray(course.tags)
                                ? course.tags.join(", ")
                                : course.tags || "",
                            "Created At": course.createdAt
                                ? moment(course.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": course.updatedAt
                                ? moment(course.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                            console.log(
                                "📄 Sample formatted course:",
                                formattedCourse
                            );
                        }

                        return formattedCourse;
                    } catch (formatError) {
                        console.error(
                            "❌ Error formatting course at index",
                            index,
                            ":",
                            formatError
                        );
                        console.error("❌ Problematic course data:", course);
                        // Return a basic format to prevent the whole process from failing
                        return {
                            "Course ID": course.id || course._id || "Unknown",
                            Title: course.title || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Create fetch function for download
            const fetchCoursesForDownload = async () => {
                console.log("📡 Fetching courses for download...");
                const downloadLimit = limit === "all" ? -1 : limit;

                // Ensure status=1 for courses (not webinars)
                const coursesFilters = { ...activeFilters, status: 1 };

                const response = await api.getCourses(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    pagination.sort || "",
                    coursesFilters
                );

                console.log("📡 Fetch response for download:", response);
                return response;
            };

            console.log("🔄 Starting CSV download with filename:", filename);

            await downloadCSV(
                fetchCoursesForDownload,
                filename,
                formatCourseData,
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

    const columns = getCoursesTableColumns({
        handleView: localHandleView,
        handleEdit: localHandleEdit,
        handleDelete,
    });

    const dataSource = Array.isArray(courseData)
        ? courseData.map((course) => ({
              ...course,
              key: course.id || course._id,
          }))
        : [];

    return (
        <>
            <CoursesTableToolbar
                onBulkDownload={handleBulkDownload}
                onCreateNew={openDrawerForCreate}
                onSearch={openSearchFilterDrawer}
                filterActive={Object.keys(activeFilters).length > 0}
            />

            <Table
                className={styles.customTable}
                size="middle"
                scroll={{ x: "max-content" }}
                columns={columns}
                dataSource={dataSource}
                onChange={handleChange}
                pagination={getPaginationConfig({
                    pagination,
                    onChangePagination,
                })}
            />

            {/* Form drawer for create/edit */}
            <CoursesFormDrawer
                open={formDrawerOpen}
                onClose={closeFormDrawer}
                initialValues={editingCourse}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for read-only display */}
            <CoursesViewDrawer
                open={viewDrawerOpen}
                onClose={closeViewDrawer}
                courseData={viewingCourse}
            />

            {/* Search and filter drawer */}
            <CoursesSearchFilterDrawer
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
                entityName="Courses"
            />
        </>
    );
};

export default CoursesTable;
