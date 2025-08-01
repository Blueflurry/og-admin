import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message } from "antd";

import CarouselsTable from "../../components/CarouselsTableComponent/CarouselsTable";
import CarouselsFormDrawer from "../../components/CarouselsTableComponent/CarouselsFormDrawer";
import CarouselsViewDrawer from "../../components/CarouselsTableComponent/CarouselsViewDrawer";

const Carousels = () => {
    const { api, isLoading, error } = useAPI();
    const [carousels, setCarousels] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "order", // Default sort by display order
        filters: { type: 2 }, // Ensure type=2 for carousels
    });

    // State for drawers
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [selectedCarousel, setSelectedCarousel] = useState(null);

    useEffect(() => {
        fetchCarousels();
    }, [updateRecords]);

    const fetchCarousels = async () => {
        try {
            // Extract filters and sort from updateRecords
            const { page, limit, sort, filters = {} } = updateRecords;

            // Always ensure type=2 is in the filters for carousels
            const carouselFilters = { ...filters, type: 2 };

            const data = await api.getCarousels(
                page,
                limit,
                sort,
                carouselFilters
            );

            // Handle the response structure
            if (data && data.data) {
                const carouselData = data.data.docs || data.data;
                setCarousels(Array.isArray(carouselData) ? carouselData : []);

                // Update pagination
                setPagination({
                    page: data.data.page || updateRecords.page,
                    limit: data.data.limit || updateRecords.limit,
                    sort: updateRecords.sort,
                    totalDocs: data.data.totalDocs || carouselData.length || 0,
                    ...data.data,
                });
            }
        } catch (err) {
            message.error("Failed to fetch carousels");
        }
    };

    // Handlers for CRUD operations
    const handleCreate = () => {
        setSelectedCarousel(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (carousel) => {
        setSelectedCarousel(carousel);
        setFormDrawerOpen(true);
    };

    const handleView = (carousel) => {
        setSelectedCarousel(carousel);
        setViewDrawerOpen(true);
    };

    const handleDelete = async (carousel) => {
        try {
            const carouselId = carousel.id || carousel._id;

            await api.deleteCarousel(carouselId);

            message.success("Carousel deleted successfully");
            fetchCarousels(); // Reload the carousel list after deletion
        } catch (error) {
            message.error("Failed to delete carousel");
        }
    };

    const handleFormSuccess = () => {
        fetchCarousels();
    };

    const handleUpdateRecords = (newRecords) => {
        setUpdateRecords((prevRecords) => ({
            ...prevRecords,
            ...newRecords,
            filters: {
                ...prevRecords.filters,
                ...newRecords.filters,
                type: 2, // Always ensure type=2
            },
        }));
    };

    if (isLoading && carousels.length === 0) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Card title="Manage Carousels">
            <CarouselsTable
                carouselData={carousels}
                pagination={pagination}
                setUpdateRecords={handleUpdateRecords}
                handleView={handleView}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
            />

            {/* Form drawer for create/edit */}
            <CarouselsFormDrawer
                open={formDrawerOpen}
                onClose={() => setFormDrawerOpen(false)}
                initialValues={selectedCarousel}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for detailed view */}
            <CarouselsViewDrawer
                open={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                carouselData={selectedCarousel}
            />
        </Card>
    );
};

export default Carousels;
