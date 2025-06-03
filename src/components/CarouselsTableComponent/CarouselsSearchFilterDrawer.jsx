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

const CarouselsSearchFilterDrawer = ({
    open,
    onClose,
    filterConfig,
    sortOptions,
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

            // Skip type because it's always 2 for carousels
            if (key === "type") return;

            // Check if value is a regex object
            if (value && value.$regex) {
                formattedValues[key] = value.$regex;
            } else if (value && value.$in) {
                formattedValues[key] = value.$in;
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

        // Always include type=2 for carousels
        filters.type = 2;

        // Process each filter field
        Object.entries(filterConfig).forEach(([key, config]) => {
            const fieldType = config.type;

            switch (fieldType) {
                case "text":
                    if (values[key]) {
                        // For text fields, use regex search
                        filters[key] = { $regex: values[key], $options: "i" };
                    }
                    break;

                case "multi-select":
                    const selectedValues = values[key];
                    if (
                        selectedValues &&
                        Array.isArray(selectedValues) &&
                        selectedValues.length > 0
                    ) {
                        filters[key] = { $in: selectedValues };
                    }
                    break;

                default:
                    // Default handling for other field types
                    if (values[key] !== undefined && values[key] !== "") {
                        filters[key] = values[key];
                    }
            }
        });

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

    // Render different form items based on filter type
    const renderFilterField = (key, config) => {
        const { type, label, options } = config;

        switch (type) {
            case "text":
                return (
                    <Form.Item key={key} name={key} label={label}>
                        <Input
                            placeholder={`Search by ${label.toLowerCase()}`}
                        />
                    </Form.Item>
                );

            case "multi-select":
                return (
                    <Form.Item key={key} name={key} label={label}>
                        <Select
                            mode="multiple"
                            placeholder={`Select ${label.toLowerCase()}`}
                            style={{ width: "100%" }}
                        >
                            {options &&
                                options.map((option) => (
                                    <Option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>
                );

            default:
                return null;
        }
    };

    return (
        <Drawer
            title={
                <div style={{ display: "flex", alignItems: "center" }}>
                    <FilterOutlined style={{ marginRight: 8 }} />
                    <span>Search & Filter Carousels</span>
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
                {sortOptions && sortOptions.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Title level={5}>Sort By</Title>
                        <Form.Item name="sort">
                            <Radio.Group>
                                {sortOptions.map((option) => (
                                    <Radio
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        </Form.Item>
                        <Divider />
                    </div>
                )}

                {/* Filter Fields */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Search Filters</Text>
                </div>

                {Object.entries(filterConfig).map(([key, config]) => (
                    <div key={key}>{renderFilterField(key, config)}</div>
                ))}
            </Form>
        </Drawer>
    );
};

export default CarouselsSearchFilterDrawer;
