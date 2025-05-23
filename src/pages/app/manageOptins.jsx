import React, { useState, useEffect } from "react";
import { Card, message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import ManageOptinsTable from "../../components/ManageOptinsTableComponent/ManageOptinsTable";
import { useAPI } from "../../hooks/useAPI";

// const { confirm } = Modal;

const ManageOptins = () => {
    const { api, isLoading, error } = useAPI();
    const [optins, setOptins] = useState([]);
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
        filters: { type: 0 }, // Default to filter for optins (type=0)
    });

    // Fetch optins on component mount and when updateRecords changes
    useEffect(() => {
        fetchOptins();
    }, [updateRecords]);

    const fetchOptins = async () => {
        try {
            const { page, limit, sort, filters } = updateRecords;

            // Always ensure type=0 is in the filters for optins
            const optinFilters = { ...filters, type: 0 };

            const response = await api.getManageOptins({
                page,
                limit,
                sort,
                filters: optinFilters,
            });

            if (response && response.data) {
                // Handle pagination response
                if (response.data.docs) {
                    setOptins(response.data.docs);
                    setPagination({
                        page: response.data.page,
                        limit: response.data.limit,
                        totalDocs: response.data.totalDocs,
                        sort,
                    });
                } else {
                    // If API doesn't return paginated response
                    setOptins(response.data);
                    setPagination({
                        ...pagination,
                        totalDocs: response.data.length,
                        sort,
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching optins:", error);
            message.error("Failed to load optins");
        }
    };

    // Handle optin deletion
    const handleDelete = async (record) => {
        // confirm({
        //     title: "Are you sure you want to delete this optin?",
        //     icon: <ExclamationCircleOutlined />,
        //     content: "This action cannot be undone.",
        //     okText: "Yes",
        //     okType: "danger",
        //     cancelText: "No",
        //     onOk: async () => {
        try {
            await api.deleteManageOptin(record.id || record._id);
            message.success("Optin deleted successfully");
            fetchOptins();
        } catch (error) {
            console.error("Error deleting optin:", error);
            message.error("Failed to delete optin");
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
        <div className="manage-optins-page">
            <Card
                title="Manage Optins"
                loading={isLoading && optins.length === 0}
            >
                <ManageOptinsTable
                    optinData={optins}
                    pagination={pagination}
                    setUpdateRecords={handleUpdateRecords}
                    handleDelete={handleDelete}
                />
            </Card>
        </div>
    );
};

export default ManageOptins;
