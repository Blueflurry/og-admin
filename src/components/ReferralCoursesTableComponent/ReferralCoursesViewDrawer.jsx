import React from "react";
import {
    Button,
    Col,
    Drawer,
    Row,
    Space,
    Typography,
    Card,
    Avatar,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;

const ReferralCoursesViewDrawer = ({ open, onClose, referralCourseData }) => {
    if (!referralCourseData) return null;

    return (
        <Drawer
            title="Referral Course Details"
            width={720}
            onClose={onClose}
            open={open}
            extra={
                <Space>
                    <Button onClick={onClose}>Close</Button>
                </Space>
            }
        >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Header Card */}
                <Card>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div>
                            <Title level={3} style={{ margin: 0 }}>
                                {referralCourseData.title || "No Course Name"}
                            </Title>
                            <Text type="secondary">
                                ID:{" "}
                                {referralCourseData.id ||
                                    referralCourseData._id}
                            </Text>
                        </div>
                    </div>
                </Card>

                {/* Description Section */}
                <Card title="University Name" size="small">
                    <Text>
                        {referralCourseData.description ||
                            "No university name available"}
                    </Text>
                </Card>

                {/* Metadata Section */}
                <Card>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Space direction="vertical" size="small">
                                <Text strong>Created At:</Text>
                                <Text>
                                    <CalendarOutlined
                                        style={{ marginRight: 8 }}
                                    />
                                    {referralCourseData.createdAt
                                        ? moment(
                                              referralCourseData.createdAt
                                          ).format("DD MMMM YYYY, h:mm A")
                                        : "N/A"}
                                </Text>
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Space direction="vertical" size="small">
                                <Text strong>Last Updated:</Text>
                                <Text>
                                    <CalendarOutlined
                                        style={{ marginRight: 8 }}
                                    />
                                    {referralCourseData.updatedAt
                                        ? moment(
                                              referralCourseData.updatedAt
                                          ).format("DD MMMM YYYY, h:mm A")
                                        : "N/A"}
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </Space>
        </Drawer>
    );
};

export default ReferralCoursesViewDrawer;
