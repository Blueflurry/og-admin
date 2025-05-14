import React, { useEffect, useState } from "react";
import {
    Drawer,
    Form,
    Button,
    Input,
    Select,
    Space,
    Radio,
    Divider,
    Typography,
} from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const ManageInstitutesSearchFilterDrawer = ({
    open,
    onClose,
    onApplyFilters,
    initialValues = {},
}) => {
    const [form] = Form.useForm();

    // Reset form when drawer opens
    useEffect(() => {
        if (open) {
            form.resetFields();

            // Set initial values if provided
            if (Object.keys(initialValues).length > 0) {
                const formattedValues = formatInitialValues(initialValues);
                form.setFieldsValue(formattedValues);
            }
        }
    }, [open, form, initialValues]);

    // Format the initial values to match form fields
    const formatInitialValues = (values) => {
        const formattedValues = {};

        // Process sort first (if it exists)
        if (values.sort) {
            formattedValues.sort = values.sort;
        }

        // Process all other values
        Object.entries(values).forEach(([key, value]) => {
            // Skip the sort key as it's already been processed
            if (key === "sort") return;

            // Skip type because it's always 1 for institutes
            if (key === "type") return;

            // Check if value is a regex object
            if (value && value.$regex) {
                formattedValues[key] = value.$regex;
            } else if (key === "status" && value !== undefined) {
                formattedValues[key] = value;
            } else {
                formattedValues[key] = value;
            }
        });

        return formattedValues;
    };

    // Convert form values to API filter format
    const formatFiltersForApi = (values) => {
        const filters = {};

        // Process sort first
        if (values.sort) {
            filters.sort = values.sort;
        }

        // Always include type=1 for institutes
        filters.type = 1;

        // Process text search fields
        if (values.title) {
            filters.title = { $regex: values.title, $options: "i" };
        }

        if (values.description) {
            filters.description = { $regex: values.description, $options: "i" };
        }

        if (values.link) {
            filters.link = { $regex: values.link, $options: "i" };
        }

        return filters;
    };

    const handleApply = () => {
        form.validateFields()
            .then((values) => {
                const formattedFilters = formatFiltersForApi(values);
                onApplyFilters(formattedFilters);
                onClose();
            })
            .catch((err) => {
                console.error("Validation failed:", err);
            });
    };

    const handleReset = () => {
        form.resetFields();
    };

    // Hardcoded sort options
    const sortOptions = [
        { label: "Newest First", value: "-createdAt" },
        { label: "Oldest First", value: "createdAt" },
    ];

    return (
        <Drawer
            title={
                <div style={{ display: "flex", alignItems: "center" }}>
                    <FilterOutlined style={{ marginRight: 8 }} />
                    <span>Search & Filter Institutes</span>
                </div>
            }
            width={480}
            onClose={onClose}
            open={open}
            bodyStyle={{ paddingBottom: 80 }}
            extra={
                <Space>
                    <Button onClick={handleReset} icon={<ClearOutlined />}>
                        Reset
                    </Button>
                    <Button
                        onClick={handleApply}
                        type="primary"
                        icon={<SearchOutlined />}
                    >
                        Apply
                    </Button>
                </Space>
            }
        >
            <Form form={form} layout="vertical" initialValues={{}}>
                {/* Sort Options */}
                <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Sort By</Title>
                    <Form.Item name="sort">
                        <Radio.Group>
                            {sortOptions.map((option) => (
                                <Radio key={option.value} value={option.value}>
                                    {option.label}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                    <Divider />
                </div>

                {/* Basic Search Section */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Basic Search</Text>
                    </div>

                    <Form.Item name="title" label="Institute Name">
                        <Input placeholder="Search by institute name" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input placeholder="Search by description" />
                    </Form.Item>

                    <Form.Item name="link" label="Website URL">
                        <Input placeholder="Search by website URL" />
                    </Form.Item>

                    <Divider />
                </div>
            </Form>
        </Drawer>
    );
};

export default ManageInstitutesSearchFilterDrawer;
