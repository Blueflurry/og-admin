// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserPermission } from "../hooks/useUserPermission";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an AuthContext

const PrivateRoute = ({ children, module, action }) => {
    const { currentUser } = useAuth();
    const { can } = useUserPermission();

    if (!currentUser) {
        // Redirect to login if not authenticated
        return <Navigate to="/auth/login" replace />;
    }

    if (module && action && !can(module, action)) {
        // Redirect to unauthorized page if user doesn't have permission
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default PrivateRoute;
