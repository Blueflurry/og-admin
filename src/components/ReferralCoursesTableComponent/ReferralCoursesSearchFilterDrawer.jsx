import React, { useEffect } from "react";
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Space,
    Radio,
    Divider,
    Typography,
} from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ReferralCoursesSearchFilterDrawer = ({
    open,
    onClose,
    onSearch,
    onClear,
    initialFilters = {},
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialFilters) {
                const mapped = {};
                if (initialFilters.title && initialFilters.title.$regex) {
                    mapped.title = initialFilters.title.$regex;
                }
                if (
                    initialFilters.description &&
                    initialFilters.description.$regex
                ) {
                    mapped.description = initialFilters.description.$regex;
                }
                if (initialFilters.sort) {
                    mapped.sort = initialFilters.sort;
                }
                form.setFieldsValue(mapped);
            }
        }
    }, [form, initialFilters, open]);

    const handleSearch = () => {
        const values = form.getFieldsValue();
        const filters = {};

        if (values.title) {
            filters.title = { $regex: values.title, $options: "i" };
        }

        if (values.description) {
            filters.description = { $regex: values.description, $options: "i" };
        }

        if (values.sort) {
            filters.sort = values.sort;
        }

        onSearch(filters);
        onClose();
    };

    const handleClear = () => {
        form.resetFields();
        onClear();
        onClose();
    };

    return (
        <Drawer
            title="Search & Filter Referral Courses"
            width={500}
            onClose={onClose}
            open={open}
            extra={
                <Space>
                    <Button onClick={handleClear} icon={<ClearOutlined />}>
                        Reset
                    </Button>
                    <Button
                        onClick={handleSearch}
                        type="primary"
                        icon={<SearchOutlined />}
                    >
                        Apply
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form}>
                <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Sort By</Title>
                    <Form.Item name="sort">
                        <Radio.Group>
                            <Radio value="-createdAt">Newest First</Radio>
                            <Radio value="createdAt">Oldest First</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Divider />
                </div>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="title" label="Course Name">
                            <Input placeholder="Search by course name" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="description" label="University Name">
                            <Input placeholder="Search by university name" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default ReferralCoursesSearchFilterDrawer;
