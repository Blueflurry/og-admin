import React, { useEffect, useState } from "react";
import { Layout, Menu, Grid } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import paths from "../../constants/appUrls";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

// using 'key' property for storing the url path of this item
const items = [
    { key: paths.home, label: "Home", icon: <UserOutlined /> },
    { key: paths.allItems, label: "Items", icon: <UserOutlined /> },
    { key: paths.stays, label: "Stays", icon: <UserOutlined /> },
    { key: paths.users, label: "Users", icon: <UserOutlined /> },
    { key: paths.notifications, label: "Notifications", icon: <UserOutlined /> },
];

const Sidebar = ({ collapsed }) => {
    const screens = useBreakpoint();
    const [selectedKey, setSelectedKey] = useState(paths.home);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setSelectedKey(location.pathname);
    }, [location.pathname]);

    const onMenuItemClick = (menuEvent) => {
        setSelectedKey(menuEvent.key);
        navigate(menuEvent.key); // 'key' property stores the url path of this item
    };

    return (
        <Sider breakpoint="lg" trigger={null} collapsible collapsed={collapsed} collapsedWidth={screens.lg ? 80 : 0}>
            <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={items} onClick={onMenuItemClick} />
        </Sider>
    );
};
export default Sidebar;
