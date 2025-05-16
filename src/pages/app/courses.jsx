import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message, Modal } from "antd";

import CoursesTable from "../../components/CoursesTableComponent/CoursesTable";
import CoursesFormDrawer from "../../components/CoursesTableComponent/CoursesFormDrawer";
import CoursesViewDrawer from "../../components/CoursesTableComponent/CoursesViewDrawer";
import CoursesSearchFilterDrawer from "../../components/CoursesTableComponent/CoursesSearchFilterDrawer";

// const { confirm } = Modal;

const Courses = () => {
    const { api, isLoading, error } = useAPI();
    const [courses, setCourses] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "-createdAt",
        filters: { status: 1 }, // Default to show only courses (status=1)
    });

    // State for drawers
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, [updateRecords]);

    const fetchCourses = async () => {
        try {
            // Extract filters and sort from updateRecords
            const { page, limit, sort, filters = {} } = updateRecords;

            // Always ensure status=1 is in the filters for courses
            if (!filters.status) {
                filters.status = 1;
            }

            console.log("Fetching courses with:", {
                page,
                limit,
                sort,
                filters,
            });

            const data = await api.getCourses(page, limit, sort, filters);
            console.log("Courses data:", data);

            setCourses(data.data.docs || []);

            // Update pagination with current values
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                sort: updateRecords.sort,
                totalDocs: data.data.totalDocs || 0,
                ...data.data,
            });
        } catch (err) {
            console.error("Error fetching courses:", err);
            message.error("Failed to fetch courses");
        }
    };

    // Handlers for CRUD operations
    const handleCreate = () => {
        setSelectedCourse(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (course) => {
        console.log("Edit course:", course);
        setSelectedCourse(course);
        setFormDrawerOpen(true);
    };

    const handleView = (course) => {
        console.log("View course:", course);
        setSelectedCourse(course);
        setViewDrawerOpen(true);
    };

    const handleDelete = async (course) => {
        try {
            const courseId = course.id || course._id;
            console.log("Deleting course with ID:", courseId);
            // Call the API with explicit await
            const deleteCourse = await api.deleteCourse(courseId);
            console.log("Deleted course:", deleteCourse);

            message.success("Course deleted successfully");
            fetchCourses(); // Reload the course list after deletion
        } catch (error) {
            console.error("Error deleting course:", error);
            message.error("Failed to delete course");
        }
    };

    const handleFormSuccess = () => {
        console.log("Form submitted successfully");
        fetchCourses();
    };

    const handleUpdateRecords = (newRecords) => {
        console.log("Updating records with:", newRecords);
        setUpdateRecords((prevRecords) => ({
            ...prevRecords,
            ...newRecords,
        }));
    };

    // if (isLoading && courses.length === 0) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;

    return (
        <Card
            title="Manage Courses"
            loading={isLoading && courses.length === 0}
        >
            <CoursesTable
                courseData={courses}
                pagination={pagination}
                setUpdateRecords={handleUpdateRecords}
                handleView={handleView}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
            />

            {/* Form drawer for create/edit */}
            <CoursesFormDrawer
                open={formDrawerOpen}
                onClose={() => setFormDrawerOpen(false)}
                initialValues={selectedCourse}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for detailed view */}
            <CoursesViewDrawer
                open={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                courseData={selectedCourse}
            />
        </Card>
    );
};

export default Courses;
