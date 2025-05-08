import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../state/auth/authSlice";
import Sidebar from "./Sidebar";
import paths from "../../constants/appUrls";

const { Header, Content, Footer } = Layout;

const AppLayout = () => {
    // const dispatch = useDispatch();
    const navigate = useNavigate();
    // const isLoading = useSelector((state) => state.loading.isLoading);
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleLogout = () => {
        // dispatch(logout());
        navigate(paths.login);
    };

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
                    {/* <div
                        style={{
                            padding: 24,
                            height: "100%",
                            overflow: "auto",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div> */}
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
