// manageEmployees.jsx
import React, { useState, useEffect } from "react";
import { Card, message, Spin } from "antd";
import { useAPI } from "../../hooks/useAPI";
import ManageEmployeesTable from "../../components/ManageEmployeesTableComponent/ManageEmployeesTable";

const ManageEmployees = () => {
    const { api, isLoading, error } = useAPI();
    const [employees, setEmployees] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
        sort: "-createdAt",
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "-createdAt",
        filters: {},
    });

    // Dashboard-like loading state
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, [updateRecords]);

    const fetchEmployees = async () => {
        try {
            setRefreshing(true);
            const { page, limit, sort, filters = {} } = updateRecords;

            const response = await api.getManageEmployees(
                page,
                limit,
                sort,
                filters
            );

            if (response && response.data) {
                // Handle pagination response
                if (response.data.docs) {
                    setEmployees(response.data.docs);
                    setPagination({
                        page: response.data.page,
                        limit: response.data.limit,
                        totalDocs: response.data.totalDocs,
                        sort,
                    });
                } else {
                    // If API doesn't return paginated response
                    setEmployees(response.data);
                    setPagination({
                        ...pagination,
                        totalDocs: response.data.length,
                        sort,
                    });
                }
            }
        } catch (error) {
            message.error("Failed to load employees");
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <Card
            title="Manage Employees"
            bordered={false}
            loading={isLoading && employees.length === 0}
        >
            <ManageEmployeesTable
                employeeData={employees}
                pagination={pagination}
                setUpdateRecords={setUpdateRecords}
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
                    <Spin size="large" tip="Loading employees data..." />
                </div>
            )}
        </Card>
    );
};

export default ManageEmployees;
