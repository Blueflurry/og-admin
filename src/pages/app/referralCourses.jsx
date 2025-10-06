import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message, Spin } from "antd";
import ReferralCoursesTable from "../../components/ReferralCoursesTableComponent/ReferralCoursesTable";
import ReferralCoursesFormDrawer from "../../components/ReferralCoursesTableComponent/ReferralCoursesFormDrawer";
import ReferralCoursesViewDrawer from "../../components/ReferralCoursesTableComponent/ReferralCoursesViewDrawer";
import ReferralCoursesSearchFilterDrawer from "../../components/ReferralCoursesTableComponent/ReferralCoursesSearchFilterDrawer";

const ReferralCourses = () => {
    const { api, isLoading, error } = useAPI();
    const [referralCourses, setReferralCourses] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "-createdAt",
        filters: {},
    });

    // State for drawers
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [searchFilterDrawerOpen, setSearchFilterDrawerOpen] = useState(false);
    const [selectedReferralCourse, setSelectedReferralCourse] = useState(null);

    // Dashboard-like loading state
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchReferralCourses();
    }, [updateRecords]);

    const fetchReferralCourses = async () => {
        try {
            setRefreshing(true);
            const { page, limit, sort, filters = {} } = updateRecords;

            const data = await api.getReferralCourses(
                page,
                limit,
                sort,
                filters
            );

            setReferralCourses(data.data.docs || []);
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                totalDocs: data.data.totalDocs || 0,
                ...data.data,
            });
        } catch (err) {
            message.error("Failed to fetch referral courses");
        } finally {
            setRefreshing(false);
        }
    };

    // Handlers for CRUD operations
    const handleCreate = () => {
        setSelectedReferralCourse(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (referralCourse) => {
        setSelectedReferralCourse(referralCourse);
        setFormDrawerOpen(true);
    };

    const handleView = (referralCourse) => {
        setSelectedReferralCourse(referralCourse);
        setViewDrawerOpen(true);
    };

    const handleDelete = async (referralCourse) => {
        try {
            const referralCourseId = referralCourse.id || referralCourse._id;
            await api.deleteReferralCourse(referralCourseId);
            message.success("Referral course deleted successfully");
            fetchReferralCourses();
        } catch (error) {
            message.error("Failed to delete referral course");
        }
    };

    const handleFormSuccess = () => {
        fetchReferralCourses();
        setFormDrawerOpen(false);
    };

    const handleSearch = (filters) => {
        const next = { ...updateRecords };
        const { sort, ...rest } = filters || {};

        // If drawer provided sort, update sort; else keep existing
        if (sort) {
            next.sort = sort;
        }

        // Start from current filters and merge incoming
        const merged = { ...next.filters, ...rest };

        // If a field is not present in rest, user likely cleared it → remove it
        if (!Object.prototype.hasOwnProperty.call(rest, "title")) {
            delete merged.title;
        }
        if (!Object.prototype.hasOwnProperty.call(rest, "description")) {
            delete merged.description;
        }

        next.filters = merged;

        // Reset to first page when filters change
        next.page = 1;
        setUpdateRecords(next);
    };

    const handleClearFilters = () => {
        setUpdateRecords((prev) => ({
            ...prev,
            page: 1,
            filters: {},
        }));
    };

    // Removed seeding helper

    return (
        <Card
            title="Manage Referral Courses"
            loading={isLoading && referralCourses.length === 0}
        >
            <ReferralCoursesTable
                referralCourseData={referralCourses}
                pagination={pagination}
                setUpdateRecords={setUpdateRecords}
                handleView={handleView}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                onCreateNew={handleCreate}
                onOpenSearch={() => setSearchFilterDrawerOpen(true)}
            />

            <ReferralCoursesFormDrawer
                open={formDrawerOpen}
                onClose={() => setFormDrawerOpen(false)}
                initialValues={selectedReferralCourse}
                onSuccess={handleFormSuccess}
            />

            <ReferralCoursesViewDrawer
                open={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                referralCourseData={selectedReferralCourse}
            />

            <ReferralCoursesSearchFilterDrawer
                open={searchFilterDrawerOpen}
                onClose={() => setSearchFilterDrawerOpen(false)}
                onSearch={handleSearch}
                onClear={handleClearFilters}
                initialFilters={updateRecords.filters}
            />

            {/* Global Loading Overlay */}
            {refreshing && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 999,
                    }}
                >
                    <Spin size="large" tip="Loading referral courses data..." />
                </div>
            )}
        </Card>
    );
};

export default ReferralCourses;
