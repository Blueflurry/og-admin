// manageEmployees.jsx
import React, { useState, useEffect } from "react";
import { Card, message } from "antd";
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

    useEffect(() => {
        fetchEmployees();
    }, [updateRecords]);

    const fetchEmployees = async () => {
        try {
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
        </Card>
    );
};

export default ManageEmployees;
