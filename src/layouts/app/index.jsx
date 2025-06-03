import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Space, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import paths from "../../constants/appUrls";
import { useAuth } from "../../contexts/AuthContext";
import { Spin } from "antd";

const { Header, Content, Footer } = Layout;

const AppLayout = () => {
    const { currentUser } = useAuth();

    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const { logout, loading } = useAuth();

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleLogout = () => {
        logout();
        navigate(paths.auth + "/" + paths.login);
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    // Update for the Header section in src/layouts/app/index.jsx
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar collapsed={collapsed} />
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingRight: 24,
                        }}
                    >
                        <Button
                            type="text"
                            icon={
                                collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: "16px",
                                width: 64,
                                height: 64,
                                color: "#04248c",
                            }}
                        />
                        <Space>
                            <span style={{ color: "#04248c", marginRight: 16 }}>
                                Welcome, {currentUser?.name?.first || "User"}
                            </span>
                            <Button
                                onClick={handleLogout}
                                type="primary"
                                danger
                                style={{
                                    backgroundColor: "#e31c24",
                                    borderColor: "#e31c24",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#ff3d45";
                                    e.target.style.borderColor = "#ff3d45";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "#e31c24";
                                    e.target.style.borderColor = "#e31c24";
                                }}
                            >
                                Logout
                            </Button>
                        </Space>
                    </div>
                </Header>
                <Content style={{ padding: "16px 16px 0", overflow: "auto" }}>
                    <Outlet />
                </Content>
                <Footer
                    style={{
                        textAlign: "center",
                        background: "#f0f2f5",
                        color: "#04248c",
                        borderTop: "1px solid #e8e8e8",
                    }}
                >
                    <strong style={{ color: "#04248c" }}>Jaro Connect</strong> ©{" "}
                    {new Date().getFullYear()}. Created by{" "}
                    <span style={{ color: "#04248c", fontWeight: 500 }}>
                        Blue Flurry Pvt Ltd.
                    </span>
                </Footer>
            </Layout>
        </Layout>
    );
};
export default AppLayout;
