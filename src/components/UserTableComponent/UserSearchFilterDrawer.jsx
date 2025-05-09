// Improved UserSearchFilterDrawer.jsx with MongoDB query formatting
import React, { useState, useEffect } from "react";
import {
    Drawer,
    Form,
    Input,
    Button,
    Select,
    DatePicker,
    Switch,
    InputNumber,
    Space,
    Divider,
    Row,
    Col,
    Radio,
    Typography,
} from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
} from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";
import moment from "moment";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const UserSearchFilterDrawer = ({
    visible,
    onClose,
    onSearch,
    initialValues = {},
}) => {
    const [form] = Form.useForm();
    const [filterConfig, setFilterConfig] = useState({});
    const [sortOptions, setSortOptions] = useState([]);

    // Use the API hook
    const { api, isLoading } = useAPI();

    useEffect(() => {
        // Fetch filter configuration
        const fetchConfig = async () => {
            try {
                const res = await api.getUsersConfig();
                console.log("User filter config:", res);

                if (res?.data?.filters) {
                    setFilterConfig(res.data.filters);
                }

                if (res?.data?.sort) {
                    setSortOptions(res.data.sort);
                }
            } catch (error) {
                console.error("Error fetching user config:", error);
            }
        };

        fetchConfig();
    }, [api]);

    useEffect(() => {
        if (visible) {
            // Reset form
            form.resetFields();

            // Format initial values for form if provided
            if (Object.keys(initialValues).length > 0) {
                const formattedValues = formatInitialValues(initialValues);
                form.setFieldsValue(formattedValues);
            }
        }
    }, [visible, initialValues, form]);

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
                case "date-range":
                    if (value.$gte && value.$lt) {
                        formattedValues[key] = [
                            moment(value.$gte),
                            moment(value.$lt),
                        ];
                    }
                    break;

                case "multi-select":
                    if (value.$in) {
                        formattedValues[key] = value.$in;
                    }
                    break;

                case "number-range":
                    // For number range types, handle the from/to values
                    if (value.$gte !== undefined)
                        formattedValues[`${key}From`] = value.$gte;
                    if (value.$lte !== undefined)
                        formattedValues[`${key}To`] = value.$lte;
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

    // Convert form values to API filter format with MongoDB operators
    const formatFiltersForApi = (values) => {
        const filters = {};

        // Process sort first
        if (values.sort) {
            filters.sort = values.sort;
        }

        // Process each filter field
        Object.entries(filterConfig).forEach(([key, config]) => {
            const fieldType = config.type;

            switch (fieldType) {
                case "date-range":
                    const dateRange = values[key];
                    if (
                        dateRange &&
                        Array.isArray(dateRange) &&
                        dateRange.length === 2
                    ) {
                        filters[key] = {
                            $gte: dateRange[0].startOf("day").toISOString(),
                            $lt: dateRange[1].endOf("day").toISOString(),
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

                case "number-range":
                    const fromValue = values[`${key}From`];
                    const toValue = values[`${key}To`];

                    if (fromValue !== undefined || toValue !== undefined) {
                        filters[key] = {};
                        if (fromValue !== undefined)
                            filters[key].$gte = fromValue;
                        if (toValue !== undefined) filters[key].$lte = toValue;
                    }
                    break;

                case "number":
                    if (values[key] !== undefined) {
                        filters[key] = values[key];
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

        // Custom handling for specific fields that might not be in the config
        if (values.name && !filters.name) {
            filters.name = { $regex: values.name, $options: "i" };
        }

        if (values.email && !filters.email) {
            filters.email = { $regex: values.email, $options: "i" };
        }

        if (values.phone1 && !filters.phone1) {
            filters.phone1 = { $regex: values.phone1, $options: "i" };
        }

        return filters;
    };

    const handleApply = () => {
        form.validateFields()
            .then((values) => {
                console.log("Form values:", values);
                const formattedFilters = formatFiltersForApi(values);
                console.log("Formatted filters:", formattedFilters);
                onSearch(formattedFilters);
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
                        <Switch />
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

            case "date-range":
                return (
                    <Form.Item key={key} name={key} label={label}>
                        <RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                );

            case "number-range":
                return (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={`${key}From`}
                                    label={`Min ${label}`}
                                >
                                    <InputNumber
                                        style={{ width: "100%" }}
                                        placeholder="From"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={`${key}To`}
                                    label={`Max ${label}`}
                                >
                                    <InputNumber
                                        style={{ width: "100%" }}
                                        placeholder="To"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                );

            default:
                return null;
        }
    };

    // Group filters by type for better organization
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
                key: "rangeFilters",
                label: "Range Filters",
                types: ["number", "number-range", "date-range"],
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
                    <FilterOutlined style={{ marginRight: 8 }} />
                    <span>Search & Filter Users</span>
                </div>
            }
            width={480}
            onClose={onClose}
            open={visible}
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

                {/* Basic Search Fields */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Basic Search</Text>
                </div>

                <Form.Item name="name" label="Name">
                    <Input placeholder="Search by name" />
                </Form.Item>

                <Form.Item name="email" label="Email">
                    <Input placeholder="Search by email" />
                </Form.Item>

                <Form.Item name="phone1" label="Phone Number">
                    <Input placeholder="Search by phone number" />
                </Form.Item>

                <Divider />

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
                                // Skip the ones we've already rendered
                                if (["name", "email", "phone1"].includes(key))
                                    return null;
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

export default UserSearchFilterDrawer;
