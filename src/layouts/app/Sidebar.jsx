import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Grid } from "antd";
import { UserOutlined } from "@ant-design/icons";
import paths from "../../constants/appUrls";
import { useUserPermission } from "../../hooks/useUserPermission";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

// using 'key' property for storing the url path of this item
const items = [
    { key: paths.home, label: "Home", icon: <UserOutlined /> },
    { key: paths.users, label: "Users", icon: <UserOutlined /> },
    { key: paths.jobs, label: "Jobs", icon: <UserOutlined /> },
    { key: paths.courses, label: "Courses", icon: <UserOutlined /> },
    { key: paths.webinars, label: "Webinars", icon: <UserOutlined /> },
    {
        key: paths.notifications,
        label: "Notifications",
        icon: <UserOutlined />,
    },
    { key: paths.referrals, label: "Referrals", icon: <UserOutlined /> },
    { key: paths.manageOptins, label: "Manage Optins", icon: <UserOutlined /> },
    {
        key: paths.manageEmployess,
        label: "Manage Employess",
        icon: <UserOutlined />,
    },
    {
        key: paths.manageCompanies,
        label: "Manage Companies",
        icon: <UserOutlined />,
    },
    {
        key: paths.manageInstitutes,
        label: "Manage Institutes",
        icon: <UserOutlined />,
    },
];

const Sidebar = ({ collapsed }) => {
    const screens = useBreakpoint();
    const [selectedKey, setSelectedKey] = useState(paths.home);
    const navigate = useNavigate();
    const location = useLocation();
    const { can } = useUserPermission();

    const filteredItems = items.filter((item) => {
        const moduleMap = {
            [paths.users]: { module: "users", action: "view" },
            [paths.jobs]: { module: "jobs", action: "view" },
            [paths.courses]: { module: "courses", action: "view" },
            [paths.webinars]: { module: "webinars", action: "view" },
            [paths.notifications]: { module: "notifications", action: "view" },
            [paths.referrals]: { module: "referrals", action: "view" },
            [paths.manageOptins]: { module: "optins", action: "view" },
            [paths.manageEmployess]: { module: "employees", action: "view" },
            [paths.manageCompanies]: { module: "companies", action: "view" },
            [paths.manageInstitutes]: { module: "institutes", action: "view" },
        };

        if (item.key === paths.home) return true;

        // Check permission if the path is in the map
        if (moduleMap[item.key]) {
            const { module, action } = moduleMap[item.key];
            return can(module, action);
        }

        // By default, show the menu item if not in the map
        return true;
    });

    useEffect(() => {
        setSelectedKey(location.pathname);
    }, [location.pathname]);

    const onMenuItemClick = (menuEvent) => {
        setSelectedKey(menuEvent.key);
        navigate(menuEvent.key); // 'key' property stores the url path of this item
    };

    return (
        <Sider
            breakpoint="lg"
            trigger={null}
            width={240}
            collapsible
            collapsed={collapsed}
            collapsedWidth={screens.lg ? 80 : 0}
        >
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                items={filteredItems}
                onClick={onMenuItemClick}
            />
        </Sider>
    );
};
export default Sidebar;
