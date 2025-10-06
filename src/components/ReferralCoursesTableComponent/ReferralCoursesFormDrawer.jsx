import React, { useEffect } from "react";
import { Button, Col, Drawer, Form, Input, Row, Space, message } from "antd";
import { useAPI } from "../../hooks/useAPI";

const ReferralCoursesFormDrawer = ({
    open,
    onClose,
    initialValues = null,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading, error } = useAPI();

    // Reset form when drawer opens
    useEffect(() => {
        if (open) {
            form.resetFields();

            if (initialValues) {
                // Format the data for the form
                const formattedValues = {
                    title: initialValues.title || "",
                    description: initialValues.description || "",
                };
                form.setFieldsValue(formattedValues);
            }
        }
    }, [form, initialValues, open]);

    // Submit form
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Add type: 4 to the values being sent
            const dataToSend = {
                ...values,
                type: 4,
            };

            if (isEditMode) {
                await api.updateReferralCourse(
                    initialValues.id || initialValues._id,
                    dataToSend
                );
                message.success("Referral course updated successfully");
            } else {
                await api.createReferralCourse(dataToSend);
                message.success("Referral course created successfully");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            message.error("There was an error processing your request.");
        }
    };

    // Title based on mode
    const drawerTitle = isEditMode
        ? "Update Referral Course"
        : "Create New Referral Course";

    return (
        <Drawer
            title={drawerTitle}
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
                        {isEditMode ? "Update" : "Create"}
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form} requiredMark>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="title"
                            label="Course Name"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter the Course Name",
                                },
                            ]}
                        >
                            <Input placeholder="Enter referral course name" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label="University Name"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter the University Name",
                                },
                            ]}
                        >
                            <Input placeholder="Enter university name" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default ReferralCoursesFormDrawer;
