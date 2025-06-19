import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Grid } from "antd";
import {
    HomeOutlined,
    UserOutlined,
    TeamOutlined,
    SolutionOutlined,
    BookOutlined,
    VideoCameraOutlined,
    BellOutlined,
    ShareAltOutlined,
    CheckSquareOutlined,
    BankOutlined,
    BuildOutlined,
    DashboardOutlined,
    PictureOutlined,
    FileTextOutlined,
    TagsOutlined,
} from "@ant-design/icons";
import paths from "../../constants/appUrls";
import { useUserPermission } from "../../hooks/useUserPermission";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

// using 'key' property for storing the url path of this item
const items = [
    { key: paths.home, label: "Dashboard", icon: <DashboardOutlined /> },
    { key: paths.users, label: "Users", icon: <TeamOutlined /> },
    { key: paths.categories, label: "Categories", icon: <TagsOutlined /> },
    { key: paths.jobs, label: "Jobs", icon: <SolutionOutlined /> },
    {
        key: paths.allJobApplications,
        label: "Job Applications",
        icon: <SolutionOutlined />,
    },
    { key: paths.courses, label: "Courses", icon: <BookOutlined /> },
    { key: paths.webinars, label: "Webinars", icon: <VideoCameraOutlined /> },
    {
        key: paths.notifications,
        label: "Notifications",
        icon: <BellOutlined />,
    },
    { key: paths.referrals, label: "Referrals", icon: <ShareAltOutlined /> },
    {
        key: paths.manageOptins,
        label: "Manage Optins",
        icon: <CheckSquareOutlined />,
    },
    // {
    //     key: paths.manageEmployess,
    //     label: "Manage Employess",
    //     icon: <UserOutlined />,
    // },
    {
        key: paths.manageCompanies,
        label: "Manage Companies",
        icon: <BuildOutlined />,
    },
    {
        key: paths.manageInstitutes,
        label: "Manage Institutes",
        icon: <BankOutlined />,
    },
    { key: paths.carousels, label: "Carousels", icon: <PictureOutlined /> },
    // {
    //     key: paths.jobApplications,
    //     label: "Job Applications",
    //     icon: <FileTextOutlined />,
    // },
];

const Sidebar = ({ collapsed }) => {
    const screens = useBreakpoint();
    const [selectedKey, setSelectedKey] = useState(paths.home);
    const navigate = useNavigate();
    const location = useLocation();
    const { can } = useUserPermission();

    // Determine the active key based on current location
    const getActiveKey = (pathname) => {
        // Find the longest matching path
        let matchedKey = "/";
        let maxMatchLength = 0;

        // Check each item to find the best match
        items.forEach((item) => {
            // Skip if not a string key
            if (typeof item.key !== "string") return;

            // Check if this path is a match and is longer than previous matches
            if (
                pathname.includes(item.key) &&
                item.key.length > maxMatchLength
            ) {
                matchedKey = item.key;
                maxMatchLength = item.key.length;
            }
        });

        return matchedKey;
    };

    // Get the current active key
    const activeKey = getActiveKey(location.pathname);

    const filteredItems = items.filter((item) => {
        const moduleMap = {
            [paths.users]: { module: "users", action: "view" },
            [paths.categories]: { module: "categories", action: "view" },
            [paths.jobs]: { module: "jobs", action: "view" },
            [paths.jobApplications]: {
                module: "jobApplications",
                action: "view",
            },
            [paths.courses]: { module: "courses", action: "view" },
            [paths.webinars]: { module: "webinars", action: "view" },
            [paths.notifications]: { module: "notifications", action: "view" },
            [paths.referrals]: { module: "referrals", action: "view" },
            [paths.manageOptins]: { module: "optins", action: "view" },
            [paths.manageEmployess]: { module: "employees", action: "view" },
            [paths.manageCompanies]: { module: "companies", action: "view" },
            [paths.manageInstitutes]: { module: "institutes", action: "view" },
            [paths.carousels]: { module: "carousels", action: "view" },
            // [paths.jobApplications]: {
            //     module: "jobApplications",
            //     action: "view",
            // },
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
            style={{
                background: "#04248c",
                overflow: "hidden",
            }}
        >
            {/* Logo Section */}
            <div
                // style={{ backgroundColor: "white" }}
                onClick={() => navigate("/")}
            >
                <img
                    src="/jaro-connect-logo.png"
                    alt="Jaro Logo"
                    style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        transition: "all 0.3s",
                    }}
                />
            </div>

            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[activeKey]}
                items={filteredItems}
                onClick={onMenuItemClick}
                defaultSelectedKeys={[activeKey]}
                style={{
                    background: "transparent",
                    borderRight: 0,
                    marginTop: 16,
                }}
            />
        </Sider>
    );
};
export default Sidebar;
