// src/components/JobApplicationsTableComponent/JobApplicationsFormDrawer.jsx
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
    InputNumber,
    Upload,
    message,
    Divider,
    Card,
    Avatar,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    FileTextOutlined,
    DollarOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";

const { Option } = Select;
const { TextArea } = Input;

const JobApplicationsFormDrawer = ({
    open,
    onClose,
    initialValues = null,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading, error } = useAPI();

    // Reset form and initialize values when drawer opens or initialValues changes
    useEffect(() => {
        if (open) {
            form.resetFields();

            if (initialValues) {
                console.log("Initial values:", initialValues);

                // Format the data for the form
                const formattedValues = {
                    status:
                        initialValues.status !== undefined
                            ? initialValues.status
                            : 0,
                    experience: initialValues.experience || 0,
                    expectedSalary: initialValues.expectedSalary || 0,
                    notes: initialValues.notes || "",
                };
                form.setFieldsValue(formattedValues);
            }
        }
    }, [form, initialValues, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Format the data for API
            const applicationData = {
                status: values.status,
                experience: values.experience,
                expectedSalary: values.expectedSalary,
                notes: values.notes || "",
            };

            if (isEditMode) {
                await api.updateJobApplication(
                    initialValues.id || initialValues._id,
                    applicationData
                );
                message.success("Application updated successfully");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Form submission error:", error);
            message.error("There was an error processing your request.");
        }
    };

    // Get applicant information for display
    const applicant = initialValues?.applicant || {};
    const applicantName = applicant.name
        ? `${applicant.name.first || ""} ${applicant.name.last || ""}`
        : "Unknown Applicant";

    return (
        <Drawer
            title="Edit Job Application"
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
                        Update
                    </Button>
                </Space>
            }
        >
            {/* Applicant Information (Read-only) */}
            {isEditMode && (
                <Card
                    title="Applicant Information"
                    style={{ marginBottom: 24 }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <Avatar
                            size={64}
                            src={applicant.imageUrl || applicant.imgUrl}
                            icon={<UserOutlined />}
                            style={{ marginRight: 16 }}
                        />
                        <div>
                            <div
                                style={{ fontSize: "16px", fontWeight: "bold" }}
                            >
                                {applicantName}
                            </div>
                            {applicant.email && (
                                <div style={{ marginTop: 4 }}>
                                    <MailOutlined style={{ marginRight: 8 }} />
                                    {applicant.email}
                                </div>
                            )}
                            {applicant.phone1 && (
                                <div style={{ marginTop: 4 }}>
                                    <PhoneOutlined style={{ marginRight: 8 }} />
                                    {applicant.phone1}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resume Link */}
                    {initialValues?.resumeUrl && (
                        <div style={{ marginTop: 16 }}>
                            <Button
                                type="primary"
                                icon={<FileTextOutlined />}
                                onClick={() =>
                                    window.open(
                                        initialValues.resumeUrl,
                                        "_blank"
                                    )
                                }
                            >
                                View Resume
                            </Button>
                        </div>
                    )}
                </Card>
            )}

            <Divider>Application Details</Divider>

            <Form layout="vertical" form={form} requiredMark>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label="Application Status"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select application status",
                                },
                            ]}
                        >
                            <Select placeholder="Select status">
                                <Option value={0}>Applied</Option>
                                <Option value={1}>Under Review</Option>
                                <Option value={2}>Shortlisted</Option>
                                <Option value={3}>Rejected</Option>
                                <Option value={4}>Hired</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="experience" label="Experience (Years)">
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                max={50}
                                placeholder="Years of experience"
                                prefix={<TrophyOutlined />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="expectedSalary"
                            label="Expected Salary (₹)"
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                placeholder="Expected salary"
                                prefix={<DollarOutlined />}
                                formatter={(value) =>
                                    `₹ ${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/₹\s?|(,*)/g, "")
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="notes" label="Internal Notes">
                            <TextArea
                                rows={4}
                                placeholder="Add internal notes about this application..."
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default JobApplicationsFormDrawer;
