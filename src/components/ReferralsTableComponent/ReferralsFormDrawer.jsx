// Updated ReferralsFormDrawer.jsx with user (referrer) related fields
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
    Divider,
    message,
    Typography,
    Card,
    Avatar,
} from "antd";
import { UserOutlined, PhoneOutlined, BookOutlined } from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";
import { useAuth } from "../../contexts/AuthContext";

const { Option } = Select;
const { Text } = Typography;

const ReferralsFormDrawer = ({
    open,
    onClose,
    initialValues = null,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading, error } = useAPI();
    const { currentUser } = useAuth();
    const [referrerInfo, setReferrerInfo] = useState(null);

    // State for courses selection
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Reset form when drawer opens
    useEffect(() => {
        if (open) {
            form.resetFields();
            fetchCourses();

            if (initialValues) {
                // Format the data for the form
                const formattedValues = {
                    friendName: initialValues.friendName || "",
                    friendPhone: initialValues.friendPhone || "",
                    courseId: initialValues.courseDetails?.courseId || "",
                    status:
                        initialValues.status !== undefined
                            ? initialValues.status
                            : 0,
                };
                form.setFieldsValue(formattedValues);

                // Store the course details for display in edit mode
                if (initialValues.courseDetails) {
                    setSelectedCourse({
                        id: initialValues.courseDetails.courseId,
                        title: initialValues.courseDetails.courseName,
                        courseUrl: initialValues.courseDetails.courseUrl,
                    });
                }

                // Show user/referrer info in edit mode if available
                if (initialValues.user) {
                    const user = initialValues.user;
                    const userName = user.data?.name
                        ? `${user.data.name.first || ""} ${
                              user.data.name.last || ""
                          }`
                        : "Unknown";

                    // You could set this to a state variable to display in the form
                    setReferrerInfo({
                        name: userName,
                        email: user.data?.email || "N/A",
                        phone: user.data?.phone1 || "N/A",
                        imageUrl: user.data?.imageUrl,
                    });
                }
            }
        }
    }, [form, initialValues, open]);

    // Fetch available courses
    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const response = await api.getCourses(1, 100, { status: 1 }); // Only active courses

            if (response && response.data) {
                const courseData = response.data.docs || response.data;
                setCourses(courseData);
            }
        } catch (error) {
            message.error("Failed to load courses");
        } finally {
            setLoadingCourses(false);
        }
    };

    // Submit form
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // In edit mode, only submit the status change
            if (isEditMode) {
                await api.updateReferral(
                    initialValues.id || initialValues._id,
                    { status: values.status }
                );
                message.success("Referral status updated successfully");
            } else {
                // For create mode, process all fields
                // Find selected course details
                const selectedCourse = courses.find(
                    (course) =>
                        course.id === values.courseId ||
                        course._id === values.courseId
                );

                const referralData = {
                    user: currentUser.id || currentUser._id,
                    friendName: values.friendName,
                    friendPhone: values.friendPhone,
                    courseDetails: {
                        courseName: selectedCourse?.title || "Unknown Course",
                        courseUrl: selectedCourse?.courseUrl || "",
                        courseId: values.courseId,
                    },
                    status: values.status,
                };

                await api.createReferral(referralData);
                message.success("Referral created successfully");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            message.error("There was an error processing your request.");
        }
    };

    // Title based on mode
    const drawerTitle = isEditMode
        ? "Update Referral Status"
        : "Create New Referral";

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
                        {isEditMode ? "Update Status" : "Submit"}
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form} requiredMark>
                {/* In edit mode, show status field first */}
                {isEditMode && (
                    <>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="status"
                                    label="Status"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select status",
                                        },
                                    ]}
                                >
                                    <Select placeholder="Select status">
                                        <Option value={0}>Pending</Option>
                                        <Option value={1}>Success</Option>
                                        <Option value={2}>Rejected</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider>Referral Details (View Only)</Divider>
                    </>
                )}

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="friendName"
                            label="Friend's Name"
                            rules={[
                                {
                                    required: !isEditMode,
                                    message: "Please enter friend's name",
                                },
                            ]}
                        >
                            {isEditMode ? (
                                <Input
                                    placeholder="Friend's name"
                                    prefix={<UserOutlined />}
                                    disabled
                                />
                            ) : (
                                <Input
                                    placeholder="Friend's name"
                                    prefix={<UserOutlined />}
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="friendPhone"
                            label="Friend's Phone"
                            rules={[
                                {
                                    required: !isEditMode,
                                    message:
                                        "Please enter friend's phone number",
                                },
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message:
                                        "Please enter a valid 10-digit phone number",
                                },
                            ]}
                        >
                            {isEditMode ? (
                                <Input
                                    placeholder="Friend's phone number"
                                    prefix={<PhoneOutlined />}
                                    disabled
                                />
                            ) : (
                                <Input
                                    placeholder="Friend's phone number"
                                    prefix={<PhoneOutlined />}
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                {isEditMode ? (
                    <>
                        <Form.Item label="Selected Course">
                            <Input
                                value={
                                    selectedCourse?.title || "Unknown Course"
                                }
                                prefix={<BookOutlined />}
                                disabled
                            />
                            {selectedCourse?.courseUrl && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Course URL: </Text>
                                    <a
                                        href={selectedCourse.courseUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {selectedCourse.courseUrl}
                                    </a>
                                </div>
                            )}
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Divider>Course Information</Divider>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="courseId"
                                    label="Select Course"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a course",
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="Select a course to refer"
                                        loading={loadingCourses}
                                    >
                                        {courses.map((course) => (
                                            <Option
                                                key={course._id || course.id}
                                                value={course._id || course.id}
                                            >
                                                {course.title}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="status"
                                    label="Status"
                                    initialValue={0}
                                >
                                    <Select placeholder="Select status">
                                        <Option value={0}>Pending</Option>
                                        <Option value={1}>Success</Option>
                                        <Option value={2}>Rejected</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )}

                {isEditMode && referrerInfo && (
                    <>
                        <Divider>Referrer Information (View Only)</Divider>
                        <Space
                            direction="vertical"
                            style={{ width: "100%", marginBottom: 16 }}
                        >
                            <Card bordered>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Avatar
                                        size={48}
                                        src={referrerInfo.imageUrl}
                                        icon={<UserOutlined />}
                                        style={{ marginRight: 16 }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: "bold" }}>
                                            {referrerInfo.name}
                                        </div>
                                        <div>{referrerInfo.email}</div>
                                        <div>{referrerInfo.phone}</div>
                                    </div>
                                </div>
                            </Card>
                        </Space>
                    </>
                )}
            </Form>
        </Drawer>
    );
};

export default ReferralsFormDrawer;
