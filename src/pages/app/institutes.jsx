import React, { useState, useEffect } from "react";
import { Card, message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import ManageInstitutesTable from "../../components/ManageInstitutesTableComponent/ManageInstitutesTable";
import { useAPI } from "../../hooks/useAPI";

// const { confirm } = Modal;

const Institutes = () => {
    const { api, isLoading, error } = useAPI();
    const [institutes, setInstitutes] = useState([]);
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
        filters: { type: 1 }, // Default to filter for institutes (type=1)
    });

    // Fetch institutes on component mount and when updateRecords changes
    useEffect(() => {
        fetchInstitutes();
    }, [updateRecords]);

    const fetchInstitutes = async () => {
        try {
            const { page, limit, sort, filters } = updateRecords;

            // Always ensure type=1 is in the filters for institutes
            const instituteFilters = { ...filters, type: 1 };

            const response = await api.getInstitutes({
                page,
                limit,
                sort,
                filters: instituteFilters,
            });

            if (response && response.data) {
                // Handle pagination response
                if (response.data.docs) {
                    setInstitutes(response.data.docs);
                    setPagination({
                        page: response.data.page,
                        limit: response.data.limit,
                        totalDocs: response.data.totalDocs,
                        sort,
                    });
                } else {
                    // If API doesn't return paginated response
                    setInstitutes(response.data);
                    setPagination({
                        ...pagination,
                        totalDocs: response.data.length,
                        sort,
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching institutes:", error);
            message.error("Failed to load institutes");
        }
    };

    // Handle institute deletion
    const handleDelete = async (record) => {
        // confirm({
        //     title: "Are you sure you want to delete this institute?",
        //     icon: <ExclamationCircleOutlined />,
        //     content: "This action cannot be undone.",
        //     okText: "Yes",
        //     okType: "danger",
        //     cancelText: "No",
        //     onOk: async () => {
        try {
            await api.deleteInstitute(record.id || record._id);
            message.success("Institute deleted successfully");
            fetchInstitutes();
        } catch (error) {
            console.error("Error deleting institute:", error);
            message.error("Failed to delete institute");
        }
        //     },
        // });
    };

    // Handle record updates (pagination, sorting, filtering)
    const handleUpdateRecords = (params) => {
        setUpdateRecords((prev) => ({
            ...prev,
            ...params,
        }));
    };

    return (
        <div className="institutes-page">
            <Card
                title="Manage Institutes"
                loading={isLoading && institutes.length === 0}
            >
                <ManageInstitutesTable
                    instituteData={institutes}
                    pagination={pagination}
                    setUpdateRecords={handleUpdateRecords}
                    handleDelete={handleDelete}
                />
            </Card>
        </div>
    );
};

export default Institutes;
