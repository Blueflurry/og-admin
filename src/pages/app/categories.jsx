// src/pages/app/categories.jsx
import React, { useState, useEffect } from "react";
import { Card, message } from "antd";
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

    // Fetch categories on component mount and when updateRecords changes
    useEffect(() => {
        fetchCategories();
    }, [updateRecords]);

    const fetchCategories = async () => {
        try {
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
                        totalDocs: response.data.totalDocs,
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
            console.error("Error fetching categories:", error);
            message.error("Failed to load categories");
        }
    };

    // Handle category deletion
    const handleDelete = async (record) => {
        try {
            await api.deleteCategory(record.id || record._id);
            message.success("Category deleted successfully");
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
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
            </Card>
        </div>
    );
};

export default Categories;
