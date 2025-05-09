import React, { useEffect, useState } from "react";
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Select,
    Space,
    Switch,
    InputNumber,
    message,
} from "antd";
import { useAPI } from "../../hooks/useAPI";

const { Option } = Select;
const { TextArea } = Input;

const JobFormDrawer = ({ open, onClose, initialValues = null, onSuccess }) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading, error } = useAPI();
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);

    // Reset form and initialize values when drawer opens or initialValues changes
    useEffect(() => {
        if (open) {
            form.resetFields();

            // Fetch companies and categories for dropdowns
            // This is just a placeholder. You'll need to implement these API methods
            // fetchCompanies();
            // fetchCategories();

            if (initialValues) {
                // Format the data for the form
                const formattedValues = {
                    title: initialValues.title || "",
                    company: initialValues.company?._id || "",
                    category: initialValues.category || "",
                    description: initialValues.description || "",
                    isRemote: initialValues.isRemote || false,
                    minSalary: initialValues.minSalary || 0,
                    maxSalary: initialValues.maxSalary || 0,
                    minExperience: initialValues.minExperience || 0,
                    street: initialValues.location?.street || "",
                    city: initialValues.location?.city || "",
                    state: initialValues.location?.state || "",
                    pincode: initialValues.location?.pincode || "",
                    country: initialValues.location?.country || "",
                    status: initialValues.status,
                    type: initialValues.type,
                };
                form.setFieldsValue(formattedValues);
            }
        }
    }, [form, initialValues, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Format the data for API
            const jobData = {
                title: values.title,
                company: values.company,
                category: values.category,
                description: values.description,
                isRemote: values.isRemote,
                minSalary: values.minSalary,
                maxSalary: values.maxSalary,
                minExperience: values.minExperience,
                location: {
                    street: values.street,
                    city: values.city,
                    state: values.state,
                    pincode: values.pincode,
                    country: values.country,
                },
                status: values.status || 0,
                type: values.type || 0,
            };

            if (isEditMode) {
                await api.updateJob(
                    initialValues.id || initialValues._id,
                    jobData
                );
                message.success("Job updated successfully");
            } else {
                await api.createJob(jobData);
                message.success("Job created successfully");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Form submission error:", error);
            message.error("There was an error processing your request.");
        }
    };

    // Mock companies and categories for now
    // You would replace this with actual API data
    useEffect(() => {
        setCompanies([
            { id: "1", name: "Jaro Education" },
            { id: "2", name: "Another Company" },
        ]);

        setCategories([
            { id: "681b2d837dc9103b3cf3047b", name: "Technology" },
            { id: "2", name: "Finance" },
            { id: "3", name: "Education" },
        ]);
    }, []);

    return (
        <Drawer
            title={isEditMode ? "Edit Job" : "Create Job"}
            width={720}
            onClose={onClose}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
            extra={
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        type="primary"
                        loading={isLoading}
                    >
                        {isEditMode ? "Update" : "Submit"}
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form} requiredMark>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="title"
                            label="Job Title"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter job title",
                                },
                            ]}
                        >
                            <Input placeholder="Job title" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="company"
                            label="Company"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a company",
                                },
                            ]}
                        >
                            <Select placeholder="Select company">
                                {companies.map((company) => (
                                    <Option key={company.id} value={company.id}>
                                        {company.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="category"
                            label="Category"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a category",
                                },
                            ]}
                        >
                            <Select placeholder="Select category">
                                {categories.map((category) => (
                                    <Option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter job description",
                                },
                            ]}
                        >
                            <TextArea
                                rows={6}
                                placeholder="Job description (Markdown supported)"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="isRemote"
                            label="Remote Job"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label="Status"
                            initialValue={0}
                        >
                            <Select>
                                <Option value={1}>Active</Option>
                                <Option value={0}>Inactive</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="minSalary"
                            label="Minimum Salary (₹)"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter minimum salary",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                placeholder="Minimum salary"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="maxSalary"
                            label="Maximum Salary (₹)"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter maximum salary",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                placeholder="Maximum salary"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="minExperience"
                            label="Minimum Experience (years)"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter minimum experience",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                placeholder="Minimum experience"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="street"
                            label="Street Address"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter street address",
                                },
                            ]}
                        >
                            <Input placeholder="Street address" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="city"
                            label="City"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter city",
                                },
                            ]}
                        >
                            <Input placeholder="City" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="state"
                            label="State"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter state",
                                },
                            ]}
                        >
                            <Input placeholder="State" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="pincode"
                            label="Pincode"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter pincode",
                                },
                            ]}
                        >
                            <Input placeholder="Pincode" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="country"
                            label="Country"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter country",
                                },
                            ]}
                            initialValue="India"
                        >
                            <Input placeholder="Country" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default JobFormDrawer;
