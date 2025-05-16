import React, { useState, useEffect } from "react";
import { Card, message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import ManageCompaniesTable from "../../components/ManageCompaniesTableComponent/ManageCompaniesTable";
import { useAPI } from "../../hooks/useAPI";

// const { confirm } = Modal;

const ManageCompanies = () => {
    const { api, isLoading, error } = useAPI();
    const [companies, setCompanies] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
        sort: "-createdAt",
    });
    const [filters, setFilters] = useState({});

    // Fetch companies on component mount and when pagination/filters change
    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async (params = {}) => {
        try {
            const {
                page = pagination.page,
                limit = pagination.limit,
                sort = pagination.sort,
                filters = {},
            } = params;

            const response = await api.getManageCompanies({
                page,
                limit,
                sort,
                filters,
            });

            if (response && response.data) {
                // Handle pagination response
                if (response.data.docs) {
                    setCompanies(response.data.docs);
                    setPagination({
                        page: response.data.page,
                        limit: response.data.limit,
                        totalDocs: response.data.totalDocs,
                        sort,
                    });
                } else {
                    // If API doesn't return paginated response
                    setCompanies(response.data);
                    setPagination({
                        ...pagination,
                        totalDocs: response.data.length,
                        sort,
                    });
                }

                // Save the current filters
                setFilters(filters);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
            message.error("Failed to load companies");
        }
    };

    // Handle record updates (pagination, sorting, filtering)
    const handleUpdateRecords = (params) => {
        fetchCompanies(params);
    };

    // Handle company deletion
    const handleDelete = async (record) => {
        // confirm({
        //     title: "Are you sure you want to delete this company?",
        //     icon: <ExclamationCircleOutlined />,
        //     content: "This action cannot be undone.",
        //     okText: "Yes",
        //     okType: "danger",
        //     cancelText: "No",
        //     onOk: async () => {
        try {
            await api.deleteManageCompany(record.id || record._id);
            message.success("Company deleted successfully");
            fetchCompanies({
                page: pagination.page,
                limit: pagination.limit,
                sort: pagination.sort,
                filters,
            });
        } catch (error) {
            console.error("Error deleting company:", error);
            message.error("Failed to delete company");
        }
        //     },
        // });
    };

    return (
        <div className="companies-page">
            <Card
                title="Manage Companies"
                bordered={false}
                loading={isLoading && companies.length === 0}
            >
                <ManageCompaniesTable
                    companyData={companies}
                    pagination={pagination}
                    setUpdateRecords={handleUpdateRecords}
                    handleDelete={handleDelete}
                />
            </Card>
        </div>
    );
};

export default ManageCompanies;
