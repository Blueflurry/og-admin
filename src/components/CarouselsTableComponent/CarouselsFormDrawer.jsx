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
    Upload,
    message,
    Switch,
    InputNumber,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";

const { Option } = Select;
const { TextArea } = Input;

const CarouselsFormDrawer = ({
    open,
    onClose,
    initialValues = null,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading, error } = useAPI();
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    // Reset form and initialize values when drawer opens or initialValues changes
    useEffect(() => {
        if (open) {
            form.resetFields();

            // Reset image states
            setImageFile(null);
            setImageUrl("");
            setUploading(false);

            if (initialValues) {
                // Format the data for the form
                const formattedValues = {
                    title: initialValues.title || "",
                    description: initialValues.description || "",
                    link: initialValues.link || "",
                    isActive: initialValues.status !== -1,
                    order: initialValues.order || 0,
                };
                form.setFieldsValue(formattedValues);

                // Set image URL if available
                if (initialValues.imageUrl) {
                    setImageUrl(initialValues.imageUrl);
                }
            }
        }
    }, [form, initialValues, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Format the data for API - create FormData for image upload
            const formData = new FormData();

            // Add all form fields to FormData
            formData.append("title", values.title);
            formData.append("description", values.description || "");
            formData.append("link", values.link || "");
            formData.append("order", values.order || 0);
            formData.append("type", 2); // type=2 for carousels

            // Set status based on isActive
            let status = values.isActive ? 1 : -1;
            formData.append("status", status);

            // Add image if changed
            if (imageFile) {
                formData.append("image", imageFile);
            } else if (imageUrl && isEditMode) {
                // If editing and image not changed, pass the existing URL
                formData.append("imageUrl", imageUrl);
            }

            if (isEditMode) {
                // For edit mode
                await api.updateCarousel(
                    initialValues.id || initialValues._id,
                    formData
                );
                message.success("Carousel updated successfully");
            } else {
                // For create mode
                await api.createCarousel(formData);
                message.success("Carousel created successfully");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Form submission error:", error);
            message.error("There was an error processing your request.");
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
            title={isEditMode ? "Edit Carousel" : "Create Carousel"}
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
                    <Col
                        span={24}
                        style={{ textAlign: "center", marginBottom: 24 }}
                    >
                        <Form.Item name="carouselImage" label="Carousel Image">
                            <Upload
                                name="avatar"
                                listType="picture"
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
                                        alt="carousel"
                                        style={{
                                            width: 200,
                                            height: (200 * 9) / 16,
                                            objectFit: "contain",
                                            cursor: "pointer",
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
                            label="Title"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter title",
                                },
                            ]}
                        >
                            <Input placeholder="Carousel title" />
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
                                    message: "Please enter description",
                                },
                            ]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Carousel description"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="link"
                            label="Link (Optional)"
                            rules={[
                                {
                                    type: "url",
                                    message: "Please enter a valid URL",
                                },
                            ]}
                        >
                            <Input placeholder="https://example.com" />
                        </Form.Item>
                    </Col>
                    {/* <Col span={12}>
                        <Form.Item
                            name="order"
                            label="Display Order"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter display order",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                placeholder="0"
                            />
                        </Form.Item>
                    </Col> */}
                </Row>

                {/* <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="isActive"
                            label="Status"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                            />
                        </Form.Item>
                    </Col>
                </Row> */}
            </Form>
        </Drawer>
    );
};

export default CarouselsFormDrawer;
