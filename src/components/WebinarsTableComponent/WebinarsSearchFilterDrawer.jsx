import React, { useEffect, useState } from "react";
import {
    Drawer,
    Form,
    Button,
    Input,
    Select,
    DatePicker,
    Space,
    InputNumber,
    Radio,
    Divider,
    Row,
    Col,
    Typography,
} from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const WebinarsSearchFilterDrawer = ({
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

            // Skip non-object values or null values
            if (!value || typeof value !== "object") {
                formattedValues[key] = value;
                return;
            }

            // Find the corresponding filter config for this key
            const config = filterConfig[key];
            if (!config) return;

            switch (config.type) {
                case "date":
                    if (value.$gte) {
                        formattedValues[key] = dayjs(value.$gte);
                    }
                    break;

                case "multi-select":
                    if (value.$in) {
                        formattedValues[key] = value.$in;
                    }
                    break;

                case "number":
                    if (value.$eq !== undefined) {
                        formattedValues[key] = value.$eq;
                    }
                    break;

                default:
                    // For text searches with regex
                    if (value.$regex) {
                        formattedValues[key] = value.$regex;
                    } else {
                        // For other direct values
                        formattedValues[key] = value;
                    }
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

        // Always include status=0 for webinars
        filters.status = 0;

        // Process each filter field
        Object.entries(filterConfig).forEach(([key, config]) => {
            const fieldType = config.type;

            switch (fieldType) {
                case "date":
                    const date = values[key];
                    if (date) {
                        // Use the current date for filtering
                        filters[key] = {
                            $gte: date.startOf("day").toISOString(),
                        };
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

                case "boolean":
                    if (values[key] !== undefined) {
                        filters[key] = values[key];
                    }
                    break;

                case "number":
                    const numValue = values[key];
                    if (numValue !== undefined && numValue !== null) {
                        filters[key] = { $eq: numValue };
                    }
                    break;

                case "text":
                    if (values[key]) {
                        // For text fields, use regex search
                        filters[key] = { $regex: values[key], $options: "i" };
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

            case "number":
                return (
                    <Form.Item key={key} name={key} label={label}>
                        <InputNumber
                            style={{ width: "100%" }}
                            placeholder={`Enter ${label.toLowerCase()}`}
                        />
                    </Form.Item>
                );

            case "boolean":
                return (
                    <Form.Item
                        key={key}
                        name={key}
                        label={label}
                        valuePropName="checked"
                    >
                        <Checkbox>Yes</Checkbox>
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

            case "date":
                return (
                    <Form.Item key={key} name={key} label={label}>
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                );

            default:
                return null;
        }
    };

    // Group filters by type
    const groupFiltersByType = () => {
        // Define the order of sections
        const sections = [
            { key: "textSearch", label: "Basic Search", types: ["text"] },
            {
                key: "selectFilters",
                label: "Filter Options",
                types: ["multi-select", "boolean"],
            },
            {
                key: "dateFilters",
                label: "Date Filters",
                types: ["date"],
            },
            {
                key: "numberFilters",
                label: "Number Filters",
                types: ["number"],
            },
        ];

        // Create an object to hold filters by section
        const groupedFilters = {};

        // Initialize sections
        sections.forEach((section) => {
            groupedFilters[section.key] = {
                label: section.label,
                filters: {},
            };
        });

        // Assign filters to sections
        Object.entries(filterConfig).forEach(([key, config]) => {
            const section = sections.find((s) => s.types.includes(config.type));
            if (section) {
                groupedFilters[section.key].filters[key] = config;
            }
        });

        return groupedFilters;
    };

    const groupedFilters = groupFiltersByType();

    return (
        <Drawer
            title={
                <div style={{ display: "flex", alignItems: "center" }}>
                    {/* <FilterOutlined style={{ marginRight: 8 }} /> */}
                    <span>Search & Filter Webinars</span>
                </div>
            }
            width={480}
            onClose={onClose}
            open={open}
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

                {/* Render each filter section */}
                {Object.entries(groupedFilters).map(([sectionKey, section]) => {
                    const filterEntries = Object.entries(section.filters);
                    if (filterEntries.length === 0) return null;

                    return (
                        <div key={sectionKey} style={{ marginBottom: 24 }}>
                            <div style={{ marginBottom: 16 }}>
                                <Text strong>{section.label}</Text>
                            </div>

                            {filterEntries.map(([key, config]) => {
                                return (
                                    <div key={key}>
                                        {renderFilterField(key, config)}
                                    </div>
                                );
                            })}

                            <Divider />
                        </div>
                    );
                })}
            </Form>
        </Drawer>
    );
};

export default WebinarsSearchFilterDrawer;
