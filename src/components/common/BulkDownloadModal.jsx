import React, { useState, useEffect } from "react";
import {
    Modal,
    Radio,
    Button,
    Space,
    Typography,
    Divider,
    Input,
    Form,
} from "antd";
import {
    DownloadOutlined,
    FileExcelOutlined,
    EditOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const BulkDownloadModal = ({
    open,
    onClose,
    onDownload,
    loading = false,
    entityName = "Records", // e.g., "Users", "Jobs", "Courses"
    title, // Optional custom title
}) => {
    const [selectedLimit, setSelectedLimit] = useState(10);
    const [filename, setFilename] = useState("");
    const [form] = Form.useForm();

    const downloadOptions = [
        { label: "10 Records", value: 10 },
        { label: "20 Records", value: 20 },
        { label: "50 Records", value: 50 },
        { label: "100 Records", value: 100 },
        { label: "All Records", value: "all" },
    ];

    // Generate default filename when modal opens
    useEffect(() => {
        if (open) {
            const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
            const defaultFilename = `${entityName.toLowerCase()}_export_${timestamp}`;
            setFilename(defaultFilename);
            form.setFieldsValue({ filename: defaultFilename });
        }
    }, [open, entityName, form]);

    const handleDownload = async () => {
        try {
            const values = await form.validateFields();
            const finalFilename = values.filename.endsWith(".csv")
                ? values.filename
                : `${values.filename}.csv`;

            onDownload(selectedLimit, finalFilename);
        } catch (error) {
            console.error("Form validation failed:", error);
        }
    };

    const handleClose = () => {
        setSelectedLimit(10); // Reset to default
        setFilename("");
        form.resetFields();
        onClose();
    };

    const modalTitle = title || `Bulk Download ${entityName}`;

    return (
        <Modal
            title={
                <Space>
                    <FileExcelOutlined style={{ color: "#52c41a" }} />
                    <span>{modalTitle}</span>
                </Space>
            }
            open={open}
            onCancel={handleClose}
            footer={[
                <Button key="cancel" onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>,
                <Button
                    key="download"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    loading={loading}
                >
                    Download CSV
                </Button>,
            ]}
            width={500}
        >
            <Form form={form} layout="vertical">
                <div style={{ padding: "16px 0" }}>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        Select Download Options
                    </Title>

                    <Text
                        type="secondary"
                        style={{ marginBottom: 16, display: "block" }}
                    >
                        Choose how many {entityName.toLowerCase()} you want to
                        download:
                    </Text>

                    <Radio.Group
                        value={selectedLimit}
                        onChange={(e) => setSelectedLimit(e.target.value)}
                        style={{ width: "100%", marginBottom: 24 }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            {downloadOptions.map((option) => (
                                <Radio key={option.value} value={option.value}>
                                    {option.label}
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>

                    <Divider />

                    {/* Filename Input */}
                    <div style={{ marginBottom: 16 }}>
                        <Title level={5} style={{ marginBottom: 8 }}>
                            <EditOutlined style={{ marginRight: 8 }} />
                            Customize Filename
                        </Title>

                        <Form.Item
                            name="filename"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter a filename",
                                },
                                {
                                    pattern: /^[a-zA-Z0-9._-]+$/,
                                    message:
                                        "Filename can only contain letters, numbers, dots, hyphens, and underscores",
                                },
                            ]}
                            style={{ marginBottom: 8 }}
                        >
                            <Input
                                placeholder="Enter filename"
                                suffix=".csv"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            The .csv extension will be added automatically
                        </Text>
                    </div>

                    <Divider />

                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        <strong>Note:</strong> The download will include all
                        visible columns with the current applied filters.
                    </Text>
                </div>
            </Form>
        </Modal>
    );
};

export default BulkDownloadModal;
