import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import "./index.css";
import App from "./App.jsx";

const theme = {
    token: {
        // Primary brand color
        colorPrimary: "#04248c",
        colorPrimaryBg: "#e6e9f7",
        colorPrimaryBgHover: "#d4d9f0",
        colorPrimaryBorder: "#9ba4d1",
        colorPrimaryBorderHover: "#7b87c2",
        colorPrimaryHover: "#0530a8",
        colorPrimaryActive: "#021a63",
        colorPrimaryTextHover: "#0530a8",
        colorPrimaryText: "#04248c",
        colorPrimaryTextActive: "#021a63",

        // Secondary color (red - use minimally)
        colorError: "#e31c24",
        colorErrorBg: "#fce8e9",
        colorErrorBgHover: "#fad6d8",
        colorErrorBorder: "#f5a7aa",
        colorErrorBorderHover: "#f08589",
        colorErrorHover: "#ff3d45",
        colorErrorActive: "#b91419",
        colorErrorTextHover: "#ff3d45",
        colorErrorText: "#e31c24",
        colorErrorTextActive: "#b91419",

        // Link color
        colorLink: "#04248c",
        colorLinkHover: "#0530a8",
        colorLinkActive: "#021a63",

        // Border radius
        borderRadius: 6,

        // Font size
        fontSize: 14,

        // Control height
        controlHeight: 32,
    },
    components: {
        Menu: {
            darkItemBg: "transparent",
            darkItemSelectedBg: "rgba(255, 255, 255, 0.1)",
            darkItemHoverBg: "rgba(255, 255, 255, 0.05)",
            darkItemSelectedColor: "#ffffff",
            darkItemColor: "rgba(255, 255, 255, 0.85)",
            darkItemHoverColor: "#ffffff",
            itemMarginInline: 8,
            subMenuItemBg: "transparent",
            darkSubMenuItemBg: "transparent",
        },
        Tabs: {
            cardPadding: "4px 16px",
            cardHeight: 24,
        },
        Button: {
            primaryShadow: "0 2px 0 rgba(4, 36, 140, 0.1)",
            defaultBorderColor: "#d4d9f0",
            defaultColor: "#04248c",
        },
        Layout: {
            siderBg: "#04248c",
            headerBg: "#ffffff",
            bodyBg: "#f0f2f5",
        },
        Card: {
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
            boxShadowHover: "0 4px 8px rgba(0, 0, 0, 0.12)",
        },
        Table: {
            headerBg: "#f5f7fa",
            headerColor: "#04248c",
            headerSortActiveBg: "#e6e9f7",
            headerSortHoverBg: "#f0f2f8",
        },
        Select: {
            optionSelectedBg: "#e6e9f7",
            optionActiveBg: "#f0f2f8",
        },
        Input: {
            hoverBorderColor: "#7b87c2",
            activeBorderColor: "#04248c",
        },
        DatePicker: {
            hoverBorderColor: "#7b87c2",
            activeBorderColor: "#04248c",
        },
        Dropdown: {
            controlItemBgHover: "#e6e9f7",
            controlItemBgActive: "#d4d9f0",
        },
        Tag: {
            defaultBg: "#f0f2f8",
            defaultColor: "#04248c",
        },
        Badge: {
            dotSize: 6,
            statusSize: 6,
        },
        Statistic: {
            titleFontSize: 14,
            contentFontSize: 24,
        },
    },
};

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ConfigProvider theme={theme}>
            <App />
        </ConfigProvider>
    </StrictMode>
);
