import React, { useEffect, useState } from "react";
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Space,
    Upload,
    message,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";

const { TextArea } = Input;

const ManageCompaniesFormDrawer = ({
    open,
    onClose,
    initialValues = null,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading, error } = useAPI();
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Reset form and initialize values when drawer opens or initialValues changes
    useEffect(() => {
        if (open) {
            form.resetFields();

            // Reset image states
            setImageFile(null);
            setImageUrl(null);
            setUploading(false);

            console.log("initialValues", initialValues);
            if (initialValues) {
                // Format the data for the form
                const formattedValues = {
                    name: initialValues.data?.name || "",
                    address: {
                        street: initialValues.address?.street,
                        city: initialValues.address?.city,
                        state: initialValues.address?.state,
                        pincode: initialValues.address?.pincode,
                        country: initialValues.address?.country,
                    },
                };
                form.setFieldsValue(formattedValues);

                // Set image URL if available
                if (initialValues.data?.imageUrl) {
                    setImageUrl(initialValues.data.imageUrl);
                }
            }
        }
    }, [form, initialValues, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log("Form values:", values);
            // Format the data for API - create FormData for image upload
            const formData = new FormData();

            // Add all form fields to FormData
            formData.append("name", values.name);
            // formData.append("address", values.address || "");
            formData.append("address[street]", values.address.street);
            formData.append("address[city]", values.address.city);
            formData.append("address[state]", values.address.state);
            formData.append(
                "address[pincode]",
                values.address.pincode || "110008"
            );
            formData.append(
                "address[country]",
                values.address.country || "India"
            );

            // Add image if changed
            if (imageFile) {
                formData.append("image", imageFile);
            } else if (imageUrl && isEditMode) {
                // If editing and image not changed, pass the existing URL
                formData.append("imageUrl", imageUrl);
            }

            if (isEditMode) {
                // For edit mode
                await api.updateManageCompany(
                    initialValues.id || initialValues._id,
                    formData
                );
                message.success("Company updated successfully");
            } else {
                // For create mode
                await api.createManageCompany(formData);
                message.success("Company created successfully");
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
            title={isEditMode ? "Edit Company" : "Create Company"}
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
                        <Form.Item name="companyImage" label="Company Logo">
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
                                        alt="company logo"
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
                            name="name"
                            label="Company Name"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter company name",
                                },
                            ]}
                        >
                            <Input placeholder="Company Name" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Address" required>
                            <Row gutter={16}>
                                {/* <Col span={24}>
                                    <Form.Item
                                        name={["address", "street"]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="Street Address"
                                            style={{ marginBottom: 8 }}
                                        />
                                    </Form.Item>
                                </Col> */}
                                <Col span={12}>
                                    <Form.Item
                                        name={["address", "city"]}
                                        rules={[
                                            {
                                                required: true,
                                                message: "City is required",
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="City"
                                            style={{ marginBottom: 8 }}
                                        />
                                    </Form.Item>
                                </Col>
                                {/* <Col span={12}>
                                    <Form.Item
                                        name={["address", "state"]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="State"
                                            style={{ marginBottom: 8 }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={["address", "pincode"]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="Pincode"
                                            style={{ marginBottom: 8 }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={["address", "country"]}
                                        noStyle
                                    >
                                        <Input placeholder="Country" />
                                    </Form.Item>
                                </Col> */}
                            </Row>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default ManageCompaniesFormDrawer;
