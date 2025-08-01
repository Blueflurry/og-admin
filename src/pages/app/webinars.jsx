import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message } from "antd";
import WebinarsTable from "../../components/WebinarsTableComponent/WebinarsTable";
import WebinarsFormDrawer from "../../components/WebinarsTableComponent/WebinarsFormDrawer";
import WebinarsViewDrawer from "../../components/WebinarsTableComponent/WebinarsViewDrawer";

const Webinars = () => {
    const { api, isLoading, error } = useAPI();
    const [webinars, setWebinars] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "-createdAt",
        filters: { status: 0 }, // Default to show only webinars (status=0)
    });

    // State for drawers
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [selectedWebinar, setSelectedWebinar] = useState(null);

    const createNewWebinar = () => {
        // Set initialValues to null for new creation and handle status=0 in the WebinarsFormDrawer component
        setSelectedWebinar(null);
        setFormDrawerOpen(true);
    };

    useEffect(() => {
        fetchWebinars();
    }, [updateRecords]);

    const fetchWebinars = async () => {
        try {
            // Extract filters and sort from updateRecords
            const { page, limit, sort, filters = {} } = updateRecords;

            // Always ensure status=0 is in the filters for webinars
            const webinarFilters = { ...filters, status: 0 };

            // Use the getCourses method directly to avoid any issues
            const data = await api.getCourses(
                page,
                limit,
                sort,
                webinarFilters
            );
            setWebinars(data.data.docs || []);

            // Update pagination with current values
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                sort: updateRecords.sort,
                totalDocs: data.data.totalDocs || 0,
                ...data.data,
            });
        } catch (err) {
            message.error("Failed to fetch webinars");
        }
    };

    const handleDelete = async (webinar) => {
        try {
            const webinarId = webinar.id || webinar._id;
            // Call the API with explicit await
            const result = await api.deleteWebinar(webinarId);

            message.success("Webinar deleted successfully");
            fetchWebinars(); // Reload the webinar list after deletion
        } catch (error) {
            message.error("Failed to delete webinar");
        }
    };

    const handleEdit = (webinar) => {
        setSelectedWebinar(webinar);
        setFormDrawerOpen(true);
    };

    const handleView = (webinar) => {
        setSelectedWebinar(webinar);
        setViewDrawerOpen(true);
    };

    const handleUpdateRecords = (newRecords) => {
        // Ensure status=0 is always set for webinars
        const filters = newRecords.filters || {};
        const updatedFilters = { ...filters, status: 0 };

        setUpdateRecords((prevRecords) => ({
            ...prevRecords,
            ...newRecords,
            filters: updatedFilters,
        }));
    };

    const handleFormSuccess = () => {
        fetchWebinars();
        setFormDrawerOpen(false);
    };

    // if (isLoading && webinars.length === 0) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;

    return (
        <Card
            title="Manage Webinars"
            loading={isLoading && webinars.length === 0}
        >
            <WebinarsTable
                webinarData={webinars}
                pagination={pagination}
                setUpdateRecords={handleUpdateRecords}
                handleView={handleView}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                onCreateNew={createNewWebinar} // Pass this function
            />

            {/* Form drawer for create/edit */}
            <WebinarsFormDrawer
                open={formDrawerOpen}
                onClose={() => setFormDrawerOpen(false)}
                initialValues={selectedWebinar}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for detailed view */}
            <WebinarsViewDrawer
                open={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                courseData={selectedWebinar}
            />
        </Card>
    );
};

export default Webinars;
