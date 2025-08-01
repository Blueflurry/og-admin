// Complete Users.jsx component with enhanced bulk download
import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message } from "antd";
import UserTable from "../../components/UserTableComponent/UserTable";
import UserSearchFilterDrawer from "../../components/UserTableComponent/UserSearchFilterDrawer";
import UserFormDrawer from "../../components/UserTableComponent/UserFormDrawer";
import UserViewDrawer from "../../components/UserTableComponent/UserViewDrawer";
import UserTableToolbar from "../../components/UserTableComponent/UserTableToolbar";
import BulkDownloadModal from "../../components/common/BulkDownloadModal";
import { useBulkDownload } from "../../hooks/useBulkDownload";
import moment from "moment";

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

    // State for drawers and modals
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [bulkDownloadModalOpen, setBulkDownloadModalOpen] = useState(false);

    // Bulk download hook
    const { downloadCSV, downloading } = useBulkDownload();

    // ========================================
    // DATA FETCHING
    // ========================================

    useEffect(() => {
        fetchUsers();
    }, [updateRecords]);

    const fetchUsers = async () => {
        try {
            const data = await api.getUsers(
                updateRecords.page,
                updateRecords.limit,
                updateRecords.sort,
                updateRecords.filters
            );

            setUsers(data.data.docs);
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                totalDocs: data.data.pagination?.totalDocs || 0,
                ...data.data.pagination,
            });
        } catch (err) {
            message.error("Failed to fetch users");
        }
    };

    const handleUpdateRecords = (newRecords) => {
        setUpdateRecords((prevRecords) => ({
            ...prevRecords,
            ...newRecords,
        }));
    };

    // ========================================
    // CRUD OPERATIONS
    // ========================================

    const handleCreate = () => {
        setSelectedUser(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormDrawerOpen(true);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setViewDrawerOpen(true);
    };

    const handleDelete = async (user) => {
        try {
            const userId = user.id || user._id;
            await api.deleteUser(userId);

            message.success("User deleted successfully");
            fetchUsers(); // Reload the user list after deletion
        } catch (error) {
            message.error("Failed to delete user");
        }
    };

    const handleFormSuccess = () => {
        fetchUsers();
    };

    // ========================================
    // SEARCH & FILTER
    // ========================================

    const handleSearch = (filters) => {
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

    // ========================================
    // BULK DOWNLOAD FUNCTIONALITY
    // ========================================

    const handleBulkDownload = () => {
        setBulkDownloadModalOpen(true);
    };

    const handleDownloadConfirm = async (limit, filename) => {
        try {
            // Format user data for CSV export
            const formatUserData = (users) => {
                return users.map((user, index) => {
                    try {
                        const formattedUser = {
                            "User ID": user.id || user._id || "",
                            "First Name": user.name?.first || "",
                            "Middle Name": user.name?.middle || "",
                            "Last Name": user.name?.last || "",
                            "Full Name": `${user.name?.first || ""} ${
                                user.name?.middle || ""
                            } ${user.name?.last || ""}`.trim(),
                            Email: user.email || "",
                            "Primary Phone": user.phone1 || "",
                            "Secondary Phone": user.phone2 || "",
                            "Date of Birth": user.dob
                                ? moment(user.dob).format("DD/MM/YYYY")
                                : "",
                            "Street Address": user.address?.street || "",
                            City: user.address?.city || "",
                            State: user.address?.state || "",
                            Pincode: user.address?.pincode || "",
                            Country: user.address?.country || "",
                            Status:
                                user.status === 1
                                    ? "Active"
                                    : user.status === 0
                                    ? "Unauthorized"
                                    : "Disabled",
                            "Created At": user.createdAt
                                ? moment(user.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                            "Updated At": user.updatedAt
                                ? moment(user.updatedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "",
                        };

                        if (index === 0) {
                        }

                        return formattedUser;
                    } catch (formatError) {
                        // Return a basic format to prevent the whole process from failing
                        return {
                            "User ID": user.id || user._id || "Unknown",
                            Email: user.email || "Unknown",
                            Status: "Error formatting",
                        };
                    }
                });
            };

            // Create fetch function for download
            const fetchUsersForDownload = async () => {
                const downloadLimit = limit === "all" ? -1 : limit;

                const response = await api.getUsers(
                    1, // Always start from page 1 for downloads
                    downloadLimit,
                    updateRecords.sort,
                    updateRecords.filters
                );

                return response;
            };

            await downloadCSV(
                fetchUsersForDownload,
                filename,
                formatUserData,
                updateRecords.filters,
                updateRecords.sort
            );
        } catch (downloadError) {
            message.error(`Download failed: ${downloadError.message}`);
        } finally {
            // Always close the modal, even if there was an error
            setBulkDownloadModalOpen(false);
        }
    };

    // ========================================
    // RENDER COMPONENT
    // ========================================

    return (
        <Card title="Manage Users" loading={isLoading && users.length === 0}>
            {/* Toolbar with actions */}
            <UserTableToolbar
                onCreateNew={handleCreate}
                onSearch={() => setSearchDrawerOpen(true)}
                onBulkDownload={handleBulkDownload}
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

            {/* Enhanced Bulk download modal */}
            <BulkDownloadModal
                open={bulkDownloadModalOpen}
                onClose={() => {
                    setBulkDownloadModalOpen(false);
                }}
                onDownload={handleDownloadConfirm}
                loading={downloading}
                entityName="Users"
            />
        </Card>
    );
};

export default Users;
