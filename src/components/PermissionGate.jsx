import React from "react";
import { useUserPermission } from "../hooks/useUserPermission";

const PermissionGate = ({ module, action, children, fallback = null }) => {
    const { can } = useUserPermission();

    if (can(module, action)) {
        return children;
    }

    return fallback;
};

export default PermissionGate;
