import React, { useEffect, useState } from "react";
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Space,
    Select,
    Upload,
    message,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";

const { TextArea } = Input;
const { Option } = Select;

const ManageInstitutesFormDrawer = ({
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
            if (values.link && values.link !== "")
                formData.append("link", values.link || "");
            formData.append("type", 1); // type=1 for institutes

            // Add image if changed
            if (imageFile) {
                formData.append("image", imageFile);
            } else if (imageUrl && isEditMode) {
                // If editing and image not changed, pass the existing URL
                formData.append("imageUrl", imageUrl);
            }

            if (isEditMode) {
                // For edit mode
                await api.updateInstitute(
                    initialValues.id || initialValues._id,
                    formData
                );
                message.success("Institute updated successfully");
            } else {
                // For create mode
                await api.createInstitute(formData);
                message.success("Institute created successfully");
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
            title={isEditMode ? "Edit Institute" : "Create Institute"}
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
                    <Col
                        span={24}
                        style={{ textAlign: "center", marginBottom: 24 }}
                    >
                        <Form.Item name="instituteImage" label="Institute Logo">
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
                                        alt="institute logo"
                                        style={{
                                            width: 200,
                                            height: 200,
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
                            label="Institute Name"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter institute name",
                                },
                            ]}
                        >
                            <Input placeholder="Institute Name" />
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
                            <TextArea rows={4} placeholder="Description" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="link"
                            label="Institute Link"
                            rules={[
                                {
                                    required: false,
                                    message: "Please enter institute link",
                                },
                                {
                                    type: "url",
                                    message: "Please enter a valid URL",
                                },
                            ]}
                        >
                            <Input placeholder="Institute Website URL" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default ManageInstitutesFormDrawer;
