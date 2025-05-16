// Complete fixed Users.jsx component
import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message, Modal } from "antd";
// import { ExclamationCircleOutlined } from "@ant-design/icons";
import UserTable from "../../components/UserTableComponent/UserTable";
import UserSearchFilterDrawer from "../../components/UserTableComponent/UserSearchFilterDrawer";
import UserFormDrawer from "../../components/UserTableComponent/UserFormDrawer";
import UserViewDrawer from "../../components/UserTableComponent/UserViewDrawer";
import UserTableToolbar from "../../components/UserTableComponent/UserTableToolbar";

// const { confirm } = Modal;

const Users = () => {
    const { api, isLoading, error, resetError } = useAPI();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "-createdAt", // Default sort: latest first
        filters: {},
    });

    // State for drawers
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [updateRecords]);

    const fetchUsers = async () => {
        try {
            console.log("Fetching users with:", {
                page: updateRecords.page,
                limit: updateRecords.limit,
                sort: updateRecords.sort,
                filters: updateRecords.filters,
            });

            const data = await api.getUsers(
                updateRecords.page,
                updateRecords.limit,
                updateRecords.sort,
                updateRecords.filters
            );

            console.log("Fetched users data:", data);

            setUsers(data.data.docs);
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                totalDocs: data.data.pagination?.totalDocs || 0,
                ...data.data.pagination,
            });
        } catch (err) {
            console.error("Error fetching users:", err);
            message.error("Failed to fetch users");
        }
    };

    const handleUpdateRecords = (newRecords) => {
        console.log("Updating records with:", newRecords);
        setUpdateRecords((prevRecords) => ({
            ...prevRecords,
            ...newRecords,
        }));
    };

    // Handlers for CRUD operations
    const handleCreate = () => {
        setSelectedUser(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (user) => {
        console.log("Edit user:", user);
        setSelectedUser(user);
        setFormDrawerOpen(true);
    };

    const handleView = (user) => {
        console.log("View user:", user);
        setSelectedUser(user);
        setViewDrawerOpen(true);
    };

    const handleDelete = async (user) => {
        console.log("Delete user called with:", user);

        try {
            const userId = user.id || user._id;
            console.log("Deleting user with ID:", userId);
            // Call the API with explicit await
            const deleteUser = await api.deleteUser(userId);
            console.log("Deleted user:", deleteUser);

            message.success("User deleted successfully");
            fetchUsers(); // Reload the user list after deletion
        } catch (error) {
            console.error("Error deleting user:", error);
            message.error("Failed to delete user");
        }

        // confirm({
        //     title: "Are you sure you want to delete this user?",
        //     icon: <ExclamationCircleOutlined />,
        //     content: "This action cannot be undone.",
        //     okText: "Yes",
        //     okType: "danger",
        //     cancelText: "No",
        //     onOk: async () => {
        //         try {
        //             // Use the user's ID, falling back to _id if id is not available
        //             const userId = user.id || user._id;
        //             console.log("Deleting user with ID:", userId);

        //             // Check if the deleteUser function exists before calling it
        //             if (typeof api.deleteUser !== "function") {
        //                 console.error("api.deleteUser is not a function", api);
        //                 message.error(
        //                     "Delete functionality is not implemented"
        //                 );
        //                 return;
        //             }

        //             // Call the API with explicit await
        //             await api.deleteUser(userId);

        //             message.success("User deleted successfully");
        //             fetchUsers(); // Reload the user list after deletion
        //         } catch (error) {
        //             console.error("Error deleting user:", error);
        //             message.error("Failed to delete user");
        //         }
        //     },
        // });
    };

    const handleFormSuccess = () => {
        console.log("Form submitted successfully");
        fetchUsers();
    };

    const handleSearch = (filters) => {
        console.log("Received search filters:", filters);

        // Extract sort if it exists
        let sort = updateRecords.sort;
        if (filters.sort) {
            sort = filters.sort;
            delete filters.sort; // Remove sort from filters object
        }

        setUpdateRecords({
            ...updateRecords,
            page: 1, // Reset to first page on new search
            sort: sort,
            filters: filters,
        });
    };

    // if (isLoading && users.length === 0) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;

    return (
        <Card
            title="Manage Users"
            bordered={false}
            loading={isLoading && users.length === 0}
        >
            {/* title="User Management" */}
            {/* Toolbar with actions */}
            <UserTableToolbar
                onCreateNew={handleCreate}
                onSearch={() => setSearchDrawerOpen(true)}
                filterActive={Object.keys(updateRecords.filters).length > 0}
            />

            {/* Main table */}
            <UserTable
                userData={users}
                pagination={pagination}
                setUpdateRecords={handleUpdateRecords}
                handleView={handleView}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
            />

            {/* Form drawer for create/edit */}
            <UserFormDrawer
                open={formDrawerOpen}
                onClose={() => setFormDrawerOpen(false)}
                initialValues={selectedUser}
                onSuccess={handleFormSuccess}
            />

            {/* View drawer for detailed view */}
            <UserViewDrawer
                open={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                userData={selectedUser}
            />

            {/* Search filter drawer */}
            <UserSearchFilterDrawer
                visible={searchDrawerOpen}
                onClose={() => setSearchDrawerOpen(false)}
                onSearch={handleSearch}
                initialValues={{
                    ...updateRecords.filters,
                    sort: updateRecords.sort,
                }}
            />
        </Card>
    );
};

export default Users;
