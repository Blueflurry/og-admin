import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import UserTable from "../../components/UserTableComponent/UserTable"; // Update the import path based on your structure

const Users = () => {
    const { api, isLoading, error, resetError } = useAPI();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
    });

    useEffect(() => {
        fetchUsers();
    }, [updateRecords]);

    const fetchUsers = async () => {
        try {
            const data = await api.getUsers(
                updateRecords.page,
                updateRecords.limit
            );
            console.log("Users data:", data);
            setUsers(data.data.docs);
            setPagination(data.data.pagination);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <UserTable
                userData={users}
                pagination={pagination}
                setUpdateRecords={setUpdateRecords}
            />
        </div>
    );
};

export default Users;
