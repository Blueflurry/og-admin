import React, { useEffect, useState } from "react";
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Space,
    Switch,
    DatePicker,
    InputNumber,
    Divider,
    Card,
    message,
    Tabs,
} from "antd";
import {
    SendOutlined,
    ScheduleOutlined,
    CalendarOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";
import moment from "moment";

const { TextArea } = Input;

const NotificationsFormDrawer = ({
    open,
    onClose,
    initialValues = null,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading, error } = useAPI();
    const [activeTab, setActiveTab] = useState("immediate");

    // Reset form and initialize values when drawer opens or initialValues changes
    useEffect(() => {
        if (open) {
            form.resetFields();

            // Default to immediate send tab unless editing a scheduled notification
            setActiveTab(initialValues?.date ? "scheduled" : "immediate");

            if (initialValues) {
                // Format the data for the form
                const formattedValues = {
                    title: initialValues.title || "",
                    text: initialValues.text || "",
                    link: initialValues.link || "",
                    date: initialValues.date
                        ? moment(initialValues.date)
                        : null,
                    repeat: initialValues.repeat || false,
                    frequency: initialValues.frequency || 0,
                };
                form.setFieldsValue(formattedValues);
            }
        }
    }, [form, initialValues, open]);

    const handleSendNow = async () => {
        try {
            // Validate only the title and text fields
            await form.validateFields(["title", "text", "link"]);

            const values = form.getFieldsValue();
            const notificationData = {
                title: values.title,
                text: values.text,
                link: values.link || "",
                date: null, // Set to current time
                repeat: false,
                frequency: 0, // Set frequency to 0 for immediate notifications
            };

            if (isEditMode) {
                await api.updateNotification(
                    initialValues.id || initialValues._id,
                    notificationData
                );
                message.success("Notification updated and sent");
            } else {
                await api.createNotification(notificationData);
                message.success("Notification created and sent");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Send now error:", error);
            message.error("There was an error sending the notification");
        }
    };

    const handleSchedule = async () => {
        try {
            await form.validateFields();

            const values = form.getFieldsValue();
            const notificationData = {
                title: values.title,
                text: values.text,
                link: values.link || "",
                date: values.date.toISOString(),
                repeat: values.repeat || false,
                frequency: values.frequency || 0,
            };

            if (isEditMode) {
                await api.updateNotification(
                    initialValues.id || initialValues._id,
                    notificationData
                );
                message.success("Notification schedule updated");
            } else {
                await api.createNotification(notificationData);
                message.success("Notification scheduled successfully");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Schedule error:", error);
            message.error("There was an error scheduling the notification");
        }
    };

    // Handle tab change
    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    // Define tab items
    const tabItems = [
        {
            key: "immediate",
            label: (
                <span>
                    <SendOutlined /> Send Immediately
                </span>
            ),
            children: (
                <div style={{ padding: "16px 0" }}>
                    <p>
                        The notification will be sent to users as soon as you
                        submit.
                    </p>
                </div>
            ),
        },
        {
            key: "scheduled",
            label: (
                <span>
                    <ScheduleOutlined /> Schedule for Later
                </span>
            ),
            children: (
                <Card style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="date"
                                label="Schedule Date & Time"
                                rules={[
                                    {
                                        required: activeTab === "scheduled",
                                        message: "Please select date and time",
                                    },
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: "100%" }}
                                    placeholder="Select date and time to send notification"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="repeat"
                                label="Repeat Notification"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren={<SyncOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Frequency field in the scheduling section */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                            prevValues.repeat !== currentValues.repeat
                        }
                    >
                        {({ getFieldValue }) =>
                            getFieldValue("repeat") ? (
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item
                                            name="frequency"
                                            label="Frequency (days)"
                                            tooltip="How often this notification repeats (in days)"
                                            initialValue={1}
                                            rules={[
                                                {
                                                    required:
                                                        getFieldValue("repeat"),
                                                    message:
                                                        "Please enter frequency for repeating notifications",
                                                },
                                                {
                                                    type: "number",
                                                    min: 1,
                                                    message:
                                                        "Frequency must be at least 1 day",
                                                },
                                            ]}
                                        >
                                            <InputNumber
                                                min={1}
                                                style={{ width: "100%" }}
                                                placeholder="Days between repeats"
                                                addonAfter="days"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ) : null
                        }
                    </Form.Item>
                </Card>
            ),
        },
    ];

    return (
        <Drawer
            title={isEditMode ? "Edit Notification" : "Create Notification"}
            width={720}
            onClose={onClose}
            open={open}
            extra={
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={
                            activeTab === "immediate"
                                ? handleSendNow
                                : handleSchedule
                        }
                        type="primary"
                        loading={isLoading}
                    >
                        {activeTab === "immediate"
                            ? "Send Now"
                            : isEditMode
                            ? "Update Schedule"
                            : "Schedule"}
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form} requiredMark>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter title",
                                },
                            ]}
                        >
                            <Input placeholder="Notification title" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="text"
                            label="Text"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter notification text",
                                },
                            ]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Notification text"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="link" label="Link (Optional)">
                            <Input placeholder="URL for the notification to link to" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                {/* Tab-style UI for send options */}
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    type="card"
                    items={tabItems}
                />
            </Form>
        </Drawer>
    );
};

export default NotificationsFormDrawer;
