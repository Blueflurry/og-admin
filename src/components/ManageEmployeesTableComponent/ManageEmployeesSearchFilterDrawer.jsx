// ManageEmployeesSearchFilterDrawer.jsx
import React, { useEffect } from "react";
import {
    Drawer,
    Form,
    Button,
    Input,
    Select,
    DatePicker,
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
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ManageEmployeesSearchFilterDrawer = ({
    open,
    onClose,
    onApplyFilters,
    initialValues = {},
}) => {
    const [form] = Form.useForm();

    // Filter configuration
    const filterConfig = {
        "name.first": { type: "text", label: "First Name" },
        "name.last": { type: "text", label: "Last Name" },
        email: { type: "text", label: "Email" },
        phone1: { type: "text", label: "Phone" },
        role: {
            type: "select",
            label: "Role",
            options: [
                { value: "admin", label: "Admin" },
                { value: "manager", label: "Manager" },
                { value: "employee", label: "Employee" },
            ],
        },
        status: {
            type: "select",
            label: "Status",
            options: [
                { value: 1, label: "Active" },
                { value: 0, label: "Inactive" },
            ],
        },
        createdAt: { type: "dateRange", label: "Created Date" },
    };

    // Sort options
    const sortOptions = [
        { label: "Newest First", value: "-createdAt" },
        { label: "Oldest First", value: "createdAt" },
    ];

    useEffect(() => {
        if (open) {
            form.resetFields();

            if (Object.keys(initialValues).length > 0) {
                const formattedValues = formatInitialValues(initialValues);
                form.setFieldsValue(formattedValues);
            }
        }
    }, [open, form, initialValues]);

    // Format initial values for form
    const formatInitialValues = (values) => {
        const formattedValues = {};

        if (values.sort) {
            formattedValues.sort = values.sort;
        }

        Object.entries(values).forEach(([key, value]) => {
            if (key === "sort") return;

            if (!value || typeof value !== "object") {
                formattedValues[key] = value;
                return;
            }

            const config = filterConfig[key];
            if (!config) return;

            switch (config.type) {
                case "dateRange":
                    if (value.$gte && value.$lt) {
                        formattedValues[key] = [
                            moment(value.$gte),
                            moment(value.$lt),
                        ];
                    }
                    break;
                case "text":
                    if (value.$regex) {
                        formattedValues[key] = value.$regex;
                    } else {
                        formattedValues[key] = value;
                    }
                    break;
                case "select":
                    if (value.$in) {
                        formattedValues[key] = value.$in;
                    } else {
                        formattedValues[key] = value;
                    }
                    break;
                default:
                    formattedValues[key] = value;
            }
        });

        return formattedValues;
    };

    // Format values for API
    const formatFiltersForApi = (values) => {
        const filters = {};

        if (values.sort) {
            filters.sort = values.sort;
        }

        Object.entries(filterConfig).forEach(([key, config]) => {
            const value = values[key];
            if (value === undefined || value === null || value === "") return;

            switch (config.type) {
                case "text":
                    filters[key] = { $regex: value, $options: "i" };
                    break;
                case "select":
                    filters[key] = value;
                    break;
                case "dateRange":
                    if (Array.isArray(value) && value.length === 2) {
                        filters[key] = {
                            $gte: value[0].startOf("day").toISOString(),
                            $lt: value[1].endOf("day").toISOString(),
                        };
                    }
                    break;
                default:
                    filters[key] = value;
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

    // Render field based on its type
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
            case "select":
                return (
                    <Form.Item key={key} name={key} label={label}>
                        <Select
                            placeholder={`Select ${label.toLowerCase()}`}
                            allowClear
                        >
                            {options.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                );
            case "dateRange":
                return (
                    <Form.Item key={key} name={key} label={label}>
                        <RangePicker style={{ width: "100%" }} />
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
                    <span>Search & Filter Employees</span>
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
                <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Search Filters</Title>
                </div>

                {/* Render all filter fields */}
                {Object.entries(filterConfig).map(([key, config]) => (
                    <div key={key}>{renderFilterField(key, config)}</div>
                ))}
            </Form>
        </Drawer>
    );
};

export default ManageEmployeesSearchFilterDrawer;
