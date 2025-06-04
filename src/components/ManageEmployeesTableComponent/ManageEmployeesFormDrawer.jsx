// ManageEmployeesFormDrawer.jsx
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
    Switch,
    Divider,
    message,
    Upload,
    Avatar,
} from "antd";
import {
    UserOutlined,
    UploadOutlined,
    LoadingOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useAPI } from "../../hooks/useAPI";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

const ManageEmployeesFormDrawer = ({
    open,
    onClose,
    initialValues = null,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
    const { api, isLoading } = useAPI();

    // For profile image
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    // For password field visibility
    const [showPasswordFields, setShowPasswordFields] = useState(!isEditMode);

    useEffect(() => {
        if (open) {
            form.resetFields();
            setImageFile(null);
            setImageUrl("");
            setUploading(false);
            setShowPasswordFields(!isEditMode);

            if (initialValues) {
                const formattedValues = {
                    firstName: initialValues.name?.first || "",
                    middleName: initialValues.name?.middle || "",
                    lastName: initialValues.name?.last || "",
                    email: initialValues.email || "",
                    phone1: initialValues.phone1 || "",
                    dob: initialValues.dob ? moment(initialValues.dob) : null,
                    role: initialValues.role || "employee",
                    status: initialValues.status === 1,
                    street: initialValues.address?.street || "",
                    pincode: initialValues.address?.pincode || "",
                };
                form.setFieldsValue(formattedValues);

                if (initialValues.imageUrl) {
                    setImageUrl(initialValues.imageUrl);
                }
            }
        }
    }, [form, initialValues, open, isEditMode]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Create FormData for multipart/form-data
            const formData = new FormData();

            // Personal information
            formData.append("name[first]", values.firstName);
            formData.append("name[middle]", values.middleName || "");
            formData.append("name[last]", values.lastName || "");
            formData.append("email", values.email);
            formData.append("phone1", values.phone1 || "");
            formData.append(
                "dob",
                values.dob ? values.dob.format("YYYY-MM-DD") : ""
            );
            formData.append("role", values.role || "employee");
            formData.append("status", values.status ? 1 : 0);

            // Address
            formData.append("address[street]", values.street || "");
            formData.append("address[pincode]", values.pincode || "");

            // Password fields (only if visible)
            if (showPasswordFields && values.password) {
                formData.append("password", values.password);
                if (values.confirmPassword) {
                    formData.append("confirmPassword", values.confirmPassword);
                }
            }

            // Image (if changed)
            if (imageFile) {
                formData.append("image", imageFile);
            }

            // Make API call based on edit or create mode
            if (isEditMode) {
                await api.updateManageEmployees(
                    initialValues.id || initialValues._id,
                    formData
                );
                message.success("Employee updated successfully");
            } else {
                await api.createManageEmployees(formData);
                message.success("Employee created successfully");
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
        const file = info.file.originFileObj;
        setImageFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImageUrl(e.target.result);
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    // Custom upload request handler
    const customRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 100);
    };

    // Upload button UI
    const uploadButton = (
        <div>
            {uploading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Drawer
            title={isEditMode ? "Edit Employee" : "Create Employee"}
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
            <Form layout="vertical" form={form}>
                {/* Profile Image */}
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

                <Divider orientation="left">Personal Information</Divider>

                {/* Name Fields */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="firstName"
                            label="First Name"
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

                {/* Contact Information */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
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
                            name="phone1"
                            label="Phone Number"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter phone number",
                                },
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message:
                                        "Please enter a valid 10-digit phone number",
                                },
                            ]}
                        >
                            <Input placeholder="Phone number" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Date of Birth */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="dob"
                            label="Date of Birth"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select date of birth",
                                },
                            ]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="role"
                            label="Role"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a role",
                                },
                            ]}
                        >
                            <Select placeholder="Select role">
                                <Option value="admin">Admin</Option>
                                <Option value="manager">Manager</Option>
                                <Option value="employee">Employee</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Address</Divider>

                {/* Address Fields */}
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="street"
                            label="Street Address"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter street address",
                                },
                            ]}
                        >
                            <Input placeholder="Street address" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="pincode"
                            label="Pincode"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter pincode",
                                },
                            ]}
                        >
                            <Input placeholder="Pincode" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Account Settings</Divider>

                {/* Status */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label="Active Status"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                            />
                        </Form.Item>
                    </Col>
                    {isEditMode && (
                        <Col span={12}>
                            <Form.Item label="Change Password">
                                <Switch
                                    checked={showPasswordFields}
                                    onChange={setShowPasswordFields}
                                />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                {/* Password Fields - only shown for new employees or if changing password */}
                {showPasswordFields && (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="password"
                                    label="Password"
                                    rules={[
                                        {
                                            required: !isEditMode,
                                            message: "Please enter password",
                                        },
                                        {
                                            min: 8,
                                            message:
                                                "Password must be at least 8 characters",
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder="Password" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    dependencies={["password"]}
                                    rules={[
                                        {
                                            required: !isEditMode,
                                            message: "Please confirm password",
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (
                                                    !value ||
                                                    getFieldValue(
                                                        "password"
                                                    ) === value
                                                ) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(
                                                    new Error(
                                                        "The two passwords do not match!"
                                                    )
                                                );
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password placeholder="Confirm password" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )}
            </Form>
        </Drawer>
    );
};

export default ManageEmployeesFormDrawer;
