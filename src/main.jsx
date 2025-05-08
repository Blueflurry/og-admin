import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import "./index.css";
import App from "./App.jsx";

const theme = {
    components: {
        Menu: {
            darkItemSelectedBg: "#12253f",
            darkItemHoverBg: "#0e1d33",
            itemMarginInline: 8,
        },
        Tabs: {
            cardPadding: "4px 16px",
            cardHeight: 24,
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
