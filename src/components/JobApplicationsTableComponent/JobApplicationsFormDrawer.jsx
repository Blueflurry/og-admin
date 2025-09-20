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
                // Format the data for the form using actual API structure
                const formattedValues = {
                    status:
                        initialValues.status !== undefined
                            ? initialValues.status
                            : 0,
                    // notes: initialValues.notes || "",
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
                // notes: values.notes || "",
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
            message.error("There was an error processing your request.");
        }
    };

    // Get applicant information for display using actual API structure
    const user = initialValues?.user || {};
    const userData = user.data || user;
    const applicantName = userData.fullName
        ? userData.fullName
        : userData.name
        ? `${userData.name.first || ""} ${userData.name.last || ""}`
        : "Unknown Applicant";

    return (
        <Drawer
            title="Edit Job Application"
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
                            src={userData.imgUrl || userData.imageUrl}
                            icon={<UserOutlined />}
                            style={{ marginRight: 16 }}
                        />
                        <div>
                            <div
                                style={{ fontSize: "16px", fontWeight: "bold" }}
                            >
                                {applicantName}
                            </div>
                            {userData.email && (
                                <div style={{ marginTop: 4 }}>
                                    <MailOutlined style={{ marginRight: 8 }} />
                                    {userData.email}
                                </div>
                            )}
                            {userData.phone1 && (
                                <div style={{ marginTop: 4 }}>
                                    <PhoneOutlined style={{ marginRight: 8 }} />
                                    {userData.phone1}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resume Link */}
                    {userData.resume?.resumeUrl && (
                        <div style={{ marginTop: 16 }}>
                            <Button
                                type="primary"
                                icon={<FileTextOutlined />}
                                onClick={() =>
                                    window.open(
                                        userData.resume.resumeUrl,
                                        "_blank"
                                    )
                                }
                            >
                                View Resume
                            </Button>
                        </div>
                    )}

                    {/* Experience Summary */}
                    {userData.experience && userData.experience.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <h4>Experience Summary</h4>
                            <div style={{ maxHeight: 200, overflowY: "auto" }}>
                                {userData.experience.map((exp, index) => (
                                    <div
                                        key={index}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <div style={{ fontWeight: 500 }}>
                                            {exp.title}
                                        </div>
                                        <div
                                            style={{
                                                color: "#666",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {exp.companyName} •{" "}
                                            {exp.employmentType}
                                            {exp.isCurrent && " (Current)"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education Summary */}
                    {userData.education && userData.education.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <h4>Education Summary</h4>
                            <div style={{ maxHeight: 200, overflowY: "auto" }}>
                                {userData.education.map((edu, index) => (
                                    <div
                                        key={index}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <div style={{ fontWeight: 500 }}>
                                            {edu.name}
                                        </div>
                                        <div
                                            style={{
                                                color: "#666",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {edu.institution} •{" "}
                                            {edu.fieldOfStudy}
                                            {edu.isCurrent && " (Current)"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <Divider>Application Details</Divider>

            <Form layout="vertical" form={form} requiredMark>
                <Row gutter={16}>
                    <Col span={24}>
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
                </Row>

                {/* <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="notes" label="Internal Notes">
                            <TextArea
                                rows={4}
                                placeholder="Add internal notes about this application..."
                            />
                        </Form.Item>
                    </Col>
                </Row> */}
            </Form>
        </Drawer>
    );
};

export default JobApplicationsFormDrawer;
