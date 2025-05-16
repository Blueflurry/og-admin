// src/pages/app/notifications.jsx
import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message } from "antd";
import NotificationsTable from "../../components/NotificationsTableComponent/NotificationsTable";
import NotificationsFormDrawer from "../../components/NotificationsTableComponent/NotificationsFormDrawer";
import NotificationsViewDrawer from "../../components/NotificationsTableComponent/NotificationsViewDrawer";

const Notifications = () => {
    const { api, isLoading, error } = useAPI();
    const [notifications, setNotifications] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "-date",
        filters: {},
    });

    // State for drawers
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const fetchNotifications = async () => {
        try {
            const { page, limit, sort, filters = {} } = updateRecords;

            const data = await api.getNotifications(page, limit, sort, filters);

            setNotifications(data.data.docs || []);
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                totalDocs: data.data.totalDocs || 0,
                ...data.data,
            });
        } catch (err) {
            console.error("Error fetching notifications:", err);
            message.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [updateRecords]);

    // Handlers for CRUD operations
    const handleCreate = () => {
        setSelectedNotification(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (notification) => {
        setSelectedNotification(notification);
        setFormDrawerOpen(true);
    };

    const handleView = (notification) => {
        setSelectedNotification(notification);
        setViewDrawerOpen(true);
    };

    const handleDelete = async (notification) => {
        try {
            const notificationId = notification.id || notification._id;
            await api.deleteNotification(notificationId);
            message.success("Notification deleted successfully");
            fetchNotifications(); // Reload the list after deletion
        } catch (error) {
            console.error("Error deleting notification:", error);
            message.error("Failed to delete notification");
        }
    };

    const handleFormSuccess = () => {
        fetchNotifications();
        setFormDrawerOpen(false);
    };

    const handleUpdateRecords = (newRecords) => {
        setUpdateRecords((prevRecords) => ({
            ...prevRecords,
            ...newRecords,
        }));
    };

    // if (isLoading && notifications.length === 0) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;

    return (
        <Card
            title="Notification Management"
            loading={isLoading && notifications.length === 0}
        >
            <NotificationsTable
                notificationData={notifications}
                pagination={pagination}
                setUpdateRecords={handleUpdateRecords}
                handleView={handleView}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                onCreateNew={handleCreate}
            />

            {/* Form drawer for create/edit */}
            <NotificationsFormDrawer
                open={formDrawerOpen}
                onClose={() => setFormDrawerOpen(false)}
                initialValues={selectedNotification}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for detailed view */}
            <NotificationsViewDrawer
                open={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                notificationData={selectedNotification}
            />
        </Card>
    );
};

export default Notifications;
