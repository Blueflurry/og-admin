// src/pages/app/categories.jsx
import React, { useState, useEffect } from "react";
import { Card, message, Spin } from "antd";
import { useAPI } from "../../hooks/useAPI";
import CategoriesTable from "../../components/CategoriesTableComponent/CategoriesTable";

const Categories = () => {
    const { api, isLoading, error } = useAPI();
    const [categories, setCategories] = useState([]);
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
        filters: { type: 3 }, // Default to filter for categories (type=3)
    });

    // Dashboard-like loading state
    const [refreshing, setRefreshing] = useState(false);

    // Fetch categories on component mount and when updateRecords changes
    useEffect(() => {
        fetchCategories();
    }, [updateRecords]);

    const fetchCategories = async () => {
        try {
            setRefreshing(true);

            const { page, limit, sort, filters } = updateRecords;

            // Always ensure type=3 is in the filters for categories
            const categoryFilters = { ...filters, type: 3 };

            const response = await api.getManageCategories({
                page,
                limit,
                sort,
                filters: categoryFilters,
            });

            if (response && response.data) {
                // Handle pagination response
                if (response.data.docs) {
                    setCategories(response.data.docs);
                    setPagination({
                        page: response.data.page,
                        limit: response.data.limit,
                        totalDocs: response.data.pagination.totalDocs,
                        sort,
                    });
                } else {
                    // If API doesn't return paginated response
                    setCategories(response.data);
                    setPagination({
                        ...pagination,
                        totalDocs: response.data.length,
                        sort,
                    });
                }
            }
        } catch (error) {
            message.error("Failed to load categories");
        } finally {
            setRefreshing(false);
        }
    };

    // Handle category deletion
    const handleDelete = async (record) => {
        try {
            await api.deleteCategory(record.id || record._id);
            message.success("Category deleted successfully");
            fetchCategories();
        } catch (error) {
            message.error("Failed to delete category");
        }
    };

    // Handle record updates (pagination, sorting, filtering)
    const handleUpdateRecords = (params) => {
        setUpdateRecords((prev) => ({
            ...prev,
            ...params,
        }));
    };

    return (
        <div className="categories-page">
            <Card
                title="Manage Categories"
                loading={isLoading && categories.length === 0}
            >
                <CategoriesTable
                    categoryData={categories}
                    pagination={pagination}
                    setUpdateRecords={handleUpdateRecords}
                    handleDelete={handleDelete}
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
                        <Spin size="large" tip="Loading categories data..." />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Categories;
