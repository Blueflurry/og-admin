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
    DatePicker,
    InputNumber,
    Upload,
    message,
    Divider,
} from "antd";
import { PlusOutlined, LoadingOutlined, SwapOutlined } from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

const WebinarsFormDrawer = ({
    open,
    onClose,
    initialValues = null,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    // Check for ID to determine if it's edit mode - just having status: 0 is not enough
    const isEditMode = !!(
        initialValues &&
        (initialValues.id || initialValues._id)
    );
    const { api, isLoading, error } = useAPI();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [convertingToCourse, setConvertingToCourse] = useState(false);

    // Reset form and initialize values when drawer opens or initialValues changes
    useEffect(() => {
        if (open) {
            form.resetFields();

            // Reset image states
            setImageFile(null);
            setImageUrl("");
            setUploading(false);

            // Fetch categories for dropdown
            fetchCategories();

            if (initialValues) {
                // console.log("Initial values:", initialValues);

                // Format the data for the form
                const formattedValues = {
                    title: initialValues.title || "",
                    description: initialValues.description || "",
                    courseUrl: initialValues.courseUrl || "",
                    inviteUrl: initialValues.inviteUrl || "",
                    startDate: initialValues.startDate
                        ? moment(initialValues.startDate)
                        : null,
                    endDate: initialValues.endDate
                        ? moment(initialValues.endDate)
                        : null,
                    duration: initialValues.duration || null,
                    category:
                        initialValues.category?._id ||
                        initialValues.category?.id ||
                        initialValues.category ||
                        "",
                    // For status, set isActive to true if status is 0 or 1, false if -1
                    isActive: initialValues.status !== -1,
                };
                form.setFieldsValue(formattedValues);

                // Set image URL if available
                if (initialValues.imageUrl) {
                    setImageUrl(initialValues.imageUrl);
                }
            }
        }
    }, [form, initialValues, open]);

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

            // Format the data for API - create FormData for image upload
            const formData = new FormData();

            // Add all form fields to FormData
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("courseUrl", values.courseUrl || "");
            formData.append("inviteUrl", values.inviteUrl || "");
            formData.append("startDate", values.startDate.format("YYYY-MM-DD"));
            formData.append("endDate", values.endDate.format("YYYY-MM-DD"));
            formData.append("duration", values.duration);
            formData.append("category", values.category);

            // Set status based on isActive
            let status;
            if (values.isActive) {
                // Keep as webinar
                status = 0; // 0 is for webinars
            } else {
                // Disabled
                status = -1;
            }
            formData.append("status", status);

            // Add image if changed
            if (imageFile) {
                formData.append("image", imageFile);
            }

            if (isEditMode) {
                // For edit mode
                await api.updateWebinar(
                    initialValues.id || initialValues._id,
                    formData
                );
                message.success("Webinar updated successfully");
            } else {
                // For create mode
                await api.createWebinar(formData);
                message.success("Webinar created successfully");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Form submission error:", error);
            message.error("There was an error processing your request.");
        }
    };

    // Handle converting webinar to course
    const handleConvertToCourse = async () => {
        try {
            setConvertingToCourse(true);
            const id = initialValues.id || initialValues._id;

            // Only send the status update to convert to course (status=1)
            await api.updateWebinar(id, { status: 1 });

            message.success("Webinar successfully converted to Course");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Conversion error:", error);
            message.error("Failed to convert webinar to course");
        } finally {
            setConvertingToCourse(false);
        }
    };

    // Handle image upload
    const handleImageUpload = (info) => {
        setUploading(true);

        // Get the file
        const file = info.file.originFileObj;
        setImageFile(file);

        // Create a temporary URL for preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageUrl(e.target.result);
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    // Custom file upload component without actual upload
    const customRequest = ({ file, onSuccess }) => {
        // Call onSuccess after a short delay to simulate upload
        setTimeout(() => {
            onSuccess("ok");
        }, 100);
    };

    // Upload button component
    const uploadButton = (
        <div>
            {uploading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>
                {uploading ? "Processing" : "Upload"}
            </div>
        </div>
    );

    return (
        <Drawer
            title={isEditMode ? "Edit Webinar" : "Create Webinar"}
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
            {/* Conversion button - only show for edit mode with ID */}
            {isEditMode && (
                <div style={{ marginBottom: 20 }}>
                    <Button
                        type="primary"
                        icon={<SwapOutlined />}
                        onClick={handleConvertToCourse}
                        loading={convertingToCourse}
                        block
                    >
                        Convert Webinar to Course
                    </Button>
                    <Divider />
                </div>
            )}

            <Form layout="vertical" form={form} requiredMark>
                <Row gutter={16}>
                    <Col
                        span={24}
                        style={{ textAlign: "center", marginBottom: 24 }}
                    >
                        <Form.Item name="webinarImage" label="Webinar Image">
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                customRequest={customRequest}
                                beforeUpload={(file) => {
                                    const isJpgOrPng =
                                        file.type === "image/jpeg" ||
                                        file.type === "image/png";
                                    if (!isJpgOrPng) {
                                        message.error(
                                            "You can only upload JPG/PNG file!"
                                        );
                                    }
                                    const isLt2M = file.size / 1024 / 1024 < 2;
                                    if (!isLt2M) {
                                        message.error(
                                            "Image must be smaller than 2MB!"
                                        );
                                    }
                                    return isJpgOrPng && isLt2M;
                                }}
                                onChange={handleImageUpload}
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="avatar"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    uploadButton
                                )}
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="title"
                            label="Webinar Title"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter webinar title",
                                },
                            ]}
                        >
                            <Input placeholder="Webinar title" />
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
                                    message: "Please enter webinar description",
                                },
                            ]}
                        >
                            <TextArea
                                rows={6}
                                placeholder="Webinar description"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
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
                            >
                                {categories.map((category) => (
                                    <Option
                                        key={category._id || category.id}
                                        value={category._id || category.id}
                                    >
                                        {category.title}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="isActive"
                            label="Status"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Select defaultValue={true}>
                                <Option value={true}>Enabled</Option>
                                <Option value={false}>Disabled</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startDate"
                            label="Start Date"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select start date",
                                },
                            ]}
                        >
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endDate"
                            label="End Date"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select end date",
                                },
                            ]}
                        >
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="duration"
                            label="Duration (minutes)"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter duration",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                placeholder="Duration in minutes"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="courseUrl" label="Webinar URL">
                            <Input placeholder="Webinar URL" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="inviteUrl" label="Invite URL">
                            <Input placeholder="Invite URL" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default WebinarsFormDrawer;
