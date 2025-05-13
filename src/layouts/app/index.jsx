import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import paths from "../../constants/appUrls";
import { useAuth } from "../../contexts/AuthContext";
import { Spin } from "antd";

const { Header, Content, Footer } = Layout;

const AppLayout = () => {
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

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar collapsed={collapsed} />
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
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
                        }}
                    />
                    <Button onClick={handleLogout}>Logout</Button>
                </Header>
                <Content style={{ padding: "16px 16px 0", overflow: "auto" }}>
                    <Outlet />
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    Jaro Connect © {new Date().getFullYear()}. Created by Blue
                    Flurry Pvt Ltd.
                </Footer>
            </Layout>
        </Layout>
    );
};
export default AppLayout;
