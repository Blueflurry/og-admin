// UserFormDrawer.jsx with Alumni Role functionality
import React, { useEffect, useState } from "react";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    Row,
    Select,
    Space,
    Upload,
    message,
    Alert,
    Switch,
    Card,
} from "antd";
import dayjs from "dayjs";
import { useAPI } from "../../hooks/useAPI";
const { Option } = Select;

const UserFormDrawer = ({ open, onClose, initialValues = null, onSuccess }) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [makeAlumni, setMakeAlumni] = useState(false);
    const { api, isLoading, error, resetError } = useAPI();

    // Check if user is already alumni
    const isAlumni =
        initialValues?.userAppRole === 4 || initialValues?.userAppRole === "4";

    // Reset form and initialize values when drawer opens or initialValues changes
    useEffect(() => {
        if (open) {
            form.resetFields();
            // Reset image states
            setImageFile(null);
            setImageUrl("");
            setUploading(false);
            setMakeAlumni(false);

            if (initialValues) {
                // Format the data for the form
                const formattedValues = {
                    firstName: initialValues.name?.first || "",
                    middleName: initialValues.name?.middle || "",
                    lastName: initialValues.name?.last || "",
                    email: initialValues.email || "",
                    primaryPhone: initialValues.phone1 || "",
                    secondaryPhone: initialValues.phone2 || "",
                    dob: initialValues.dob ? dayjs(initialValues.dob) : null,
                    streetAddress: initialValues.address?.street || "",
                    city: initialValues.address?.city || "",
                    state: initialValues.address?.state || "",
                    pincode: initialValues.address?.pincode || "",
                    country: initialValues.address?.country || "",
                    status: initialValues.status || 1,
                };
                form.setFieldsValue(formattedValues);

                // Set image URL if available - Handle different image URL properties
                if (initialValues.imageUrl) {
                    setImageUrl(initialValues.imageUrl);
                } else if (initialValues.imgUrl) {
                    setImageUrl(initialValues.imgUrl);
                } else if (initialValues.img) {
                    setImageUrl(initialValues.img);
                }
            }
        }
    }, [form, initialValues, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Create FormData object for multipart/form-data
            const formData = new FormData();

            formData.append("name[first]", values.firstName);

            if (values.middleName)
                formData.append("name[middle]", values.middleName || "");
            if (values.lastName)
                formData.append("name[last]", values.lastName || "");
            formData.append("email", values.email);
            formData.append("phone1", values.primaryPhone);
            if (values.secondaryPhone)
                formData.append("phone2", values.secondaryPhone || "");
            if (values.dob)
                formData.append(
                    "dob",
                    values.dob ? values.dob.format("YYYY-MM-DD") : ""
                );

            // Add address fields using bracket notation
            if (values.streetAddress)
                formData.append("address[street]", values.streetAddress);
            if (values.city) formData.append("address[city]", values.city);
            if (values.state) formData.append("address[state]", values.state);
            if (values.country)
                formData.append("address[country]", values.country);
            if (values.pincode)
                formData.append("address[pincode]", values.pincode);

            formData.append("status", values.status);

            // Handle userAppRole based on alumni status
            if (isEditMode) {
                // If user is already alumni, keep them as alumni
                if (isAlumni) {
                    formData.append("userAppRole", "4");
                } else if (makeAlumni) {
                    // If making user alumni
                    formData.append("userAppRole", "4");
                }
            } else {
                // For new users, set alumni status if requested
                if (makeAlumni) {
                    formData.append("userAppRole", "4");
                }
            }

            // Add image file to FormData if it exists
            if (imageFile) {
                formData.append("image", imageFile);
            }

            // For edit mode, add the existing image URL if there's no new file
            if (isEditMode && !imageFile && imageUrl) {
                formData.append("imageUrl", imageUrl);
            }

            if (isEditMode) {
                await api.updateUser(
                    initialValues.id || initialValues._id,
                    formData
                );
                message.success("User updated successfully");
            } else {
                await api.createUser(formData);
                message.success("User created successfully");
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
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
            title={isEditMode ? "Edit User" : "Create User"}
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
                        <Form.Item name="profileImage" label="Profile Image">
                            <Upload
                                name="avatar"
                                listType="picture-circle"
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
                                            borderRadius: "50%",
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
                    <Col span={8}>
                        <Form.Item
                            name="firstName"
                            label={<>First Name </>}
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter first name",
                                },
                            ]}
                        >
                            <Input placeholder="First name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="middleName" label="Middle Name">
                            <Input placeholder="Middle name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="lastName" label="Last Name">
                            <Input placeholder="Last name" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label={<>Email </>}
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter email",
                                },
                                {
                                    type: "email",
                                    message: "Please enter a valid email",
                                },
                            ]}
                        >
                            <Input placeholder="Email address" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="primaryPhone"
                            label={<>Primary Phone </>}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Please enter primary phone number",
                                },
                            ]}
                        >
                            <Input placeholder="Primary phone number" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="secondaryPhone"
                            label="Secondary Phone"
                        >
                            <Input placeholder="Secondary phone number" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="dob" label={<>Date of Birth </>}>
                            <DatePicker
                                style={{ width: "100%" }}
                                placeholder="Select date"
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="streetAddress"
                            label={<>Street Address </>}
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder="Street address"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="city" label={<>City </>}>
                            <Input placeholder="City" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="state" label={<>State </>}>
                            <Input placeholder="State" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="pincode" label={<>Pincode </>}>
                            <Input placeholder="Pincode" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="country" label={<>Country </>}>
                            <Input placeholder="Country" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Status field */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="status"
                            label={<>Status </>}
                            rules={[
                                {
                                    required: true,
                                    message: "Please select user status",
                                },
                            ]}
                            initialValue={1}
                        >
                            <Select placeholder="Select user status">
                                <Option value={1}>Active</Option>
                                {/* <Option value={0}>Unauthorized</Option> */}
                                <Option value={-1}>Disabled</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Alumni Role Section */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Card
                            title="User Role"
                            size="small"
                            style={{ marginBottom: 16 }}
                        >
                            {isAlumni ? (
                                <Alert
                                    message="Alumni User"
                                    description="This user is already an alumni"
                                    type="success"
                                    showIcon
                                />
                            ) : (
                                <div>
                                    <div style={{ marginBottom: 12 }}>
                                        <strong>Current Role:</strong> New User
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                        }}
                                    >
                                        <Switch
                                            checked={makeAlumni}
                                            onChange={setMakeAlumni}
                                            checkedChildren="Alumni"
                                            unCheckedChildren="New User"
                                        />
                                        <span>
                                            {makeAlumni
                                                ? "Make this user an Alumni"
                                                : "Keep as New User"}
                                        </span>
                                    </div>
                                    {/* {makeAlumni && (
                                        <Alert
                                            message="Important"
                                            description="Once a user becomes alumni, they cannot be reverted back to new user status."
                                            type="warning"
                                            showIcon
                                            style={{ marginTop: 12 }}
                                        />
                                    )} */}
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default UserFormDrawer;
