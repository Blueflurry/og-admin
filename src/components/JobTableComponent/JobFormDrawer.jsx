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
    Avatar,
    Divider,
} from "antd";
import { TagOutlined } from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";

const { Option } = Select;
const { TextArea } = Input;

const JobFormDrawer = ({ open, onClose, initialValues = null, onSuccess }) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading, error } = useAPI();
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [jobConfig, setJobConfig] = useState({
        filters: {
            status: { options: [] },
            type: { options: [] },
        },
    });
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(false);

    // Reset form and initialize values when drawer opens or initialValues changes
    useEffect(() => {
        if (open) {
            form.resetFields();

            // Fetch companies, categories, and job config for dropdowns
            fetchCompanies();
            fetchCategories();
            fetchJobConfig();

            if (initialValues) {
                // console.log("Initial values:", initialValues);

                // Format the data for the form
                const formattedValues = {
                    title: initialValues.title || "",
                    company:
                        initialValues.company?._id ||
                        initialValues.company?.id ||
                        "",
                    // Handle category as object or string
                    category:
                        initialValues.category?._id ||
                        initialValues.category?.id ||
                        initialValues.category ||
                        "",
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

    // Fetch job configuration for dropdown options
    const fetchJobConfig = async () => {
        try {
            setLoadingConfig(true);
            const response = await api.getJobsConfig();
            // console.log("Job config API response:", response);

            if (response && response.data) {
                setJobConfig(response.data);
            }
        } catch (error) {
            console.error("Error fetching job configuration:", error);
            message.error("Failed to load job configuration");
        } finally {
            setLoadingConfig(false);
        }
    };

    // Fetch companies for dropdown
    const fetchCompanies = async () => {
        try {
            setLoadingCompanies(true);
            const response = await api.getCompanies();
            // console.log("Companies API response:", response);

            if (response && response.data) {
                // Extract companies from the response based on the structure
                let companyData = response.data;

                // If the data is in docs structure
                if (response.data.docs) {
                    companyData = response.data.docs;
                }

                setCompanies(companyData || []);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
            message.error("Failed to load companies");
        } finally {
            setLoadingCompanies(false);
        }
    };

    // Fetch categories for dropdown
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await api.getCategories();
            // console.log("Categories API response:", response);

            if (response && response.data) {
                // Extract categories from the response based on the structure
                let categoryData = response.data;

                // If the data is in docs structure
                if (response.data.docs) {
                    categoryData = response.data.docs;
                }

                setCategories(categoryData || []);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            message.error("Failed to load categories");
        } finally {
            setLoadingCategories(false);
        }
    };

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

    return (
        <Drawer
            title={isEditMode ? "Edit Job" : "Create Job"}
            width={720}
            onClose={onClose}
            open={open}
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
                            <Select
                                placeholder="Select company"
                                loading={loadingCompanies}
                                optionLabelProp="label"
                            >
                                {companies.map((company) => (
                                    <Option
                                        key={company._id || company.id}
                                        value={company._id || company.id}
                                        label={company.data?.name}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            {company.data?.imageUrl && (
                                                <Avatar
                                                    src={company.data.imageUrl}
                                                    size="small"
                                                    style={{
                                                        marginRight: 8,
                                                        objectFit: "contain",
                                                    }}
                                                />
                                            )}
                                            <span>{company.data?.name}</span>
                                        </div>
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
                            <Select
                                placeholder="Select category"
                                loading={loadingCategories}
                                optionLabelProp="label"
                            >
                                {categories.map((category) => (
                                    <Option
                                        key={category._id || category.id}
                                        value={category._id || category.id}
                                        label={category.title}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            {category.imageUrl && (
                                                <Avatar
                                                    src={category.imageUrl}
                                                    size="small"
                                                    style={{
                                                        marginRight: 8,
                                                        objectFit: "contain",
                                                    }}
                                                />
                                            )}
                                            <span>
                                                <TagOutlined
                                                    style={{ marginRight: 4 }}
                                                />
                                                {category.title}
                                            </span>
                                        </div>
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
                            <Select loading={loadingConfig}>
                                {jobConfig.filters?.status?.options?.map(
                                    (option) => (
                                        <Option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </Option>
                                    )
                                ) || [
                                    <Option key={1} value={1}>
                                        Active
                                    </Option>,
                                    <Option key={0} value={0}>
                                        Inactive
                                    </Option>,
                                ]}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="type"
                            label="Job Type"
                            initialValue={0}
                        >
                            <Select loading={loadingConfig}>
                                {jobConfig.filters?.type?.options?.map(
                                    (option) => (
                                        <Option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </Option>
                                    )
                                ) || [
                                    <Option key={0} value={0}>
                                        Internship
                                    </Option>,
                                    <Option key={1} value={1}>
                                        Contract
                                    </Option>,
                                    <Option key={2} value={2}>
                                        Part Time
                                    </Option>,
                                    <Option key={3} value={3}>
                                        Full Time
                                    </Option>,
                                ]}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                    <Col span={12}>
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
                </Row>

                <Divider orientation="left">Location</Divider>

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
