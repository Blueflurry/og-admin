import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import UserTable from "../../components/UserTableComponent/UserTable"; // Update the import path based on your structure

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
        sort: "", // Added sort parameter
    });

    useEffect(() => {
        fetchUsers();
    }, [updateRecords]);

    const fetchUsers = async () => {
        try {
            const data = await api.getUsers(
                updateRecords.page,
                updateRecords.limit,
                updateRecords.sort // Added sort parameter
            );
            console.log("Users data:", data);
            setUsers(data.data.docs);
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                totalDocs: data.data.pagination?.totalDocs || 0,
                ...data.data.pagination,
            });
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const handleUpdateRecords = (newRecords) => {
        console.log("Updating records with:", newRecords);
        setUpdateRecords(newRecords);
    };

    if (isLoading && users.length === 0) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <UserTable
                userData={users}
                pagination={pagination}
                setUpdateRecords={handleUpdateRecords}
            />
        </div>
    );
};

export default Users;
