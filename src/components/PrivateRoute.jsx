// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserPermission } from "../hooks/useUserPermission";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children, module, action }) => {
    const { currentUser, isAuthenticated } = useAuth();
    const { can } = useUserPermission();

    const userAuthenticated = isAuthenticated || !!currentUser;

    if (!userAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!can(module, action)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default PrivateRoute;
