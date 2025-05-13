// src/components/ProtectedLayout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Spin } from "antd";
import paths from "../constants/appUrls";

const ProtectedLayout = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If not loading and no user, redirect to login
        if (!loading && !currentUser) {
            navigate(paths.auth + "/" + paths.login);
        }
    }, [currentUser, loading, navigate]);

    // Show loading spinner while checking auth
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

    // If not authenticated, don't render children
    if (!currentUser) {
        return null; // The useEffect will handle the redirect
    }

    // If authenticated, render children
    return children;
};

export default ProtectedLayout;
