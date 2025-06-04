// src/hooks/useUserPermission.jsx
import { useContext } from "react";
import { usePermissions } from "../contexts/PermissionsContext";
import { useAuth } from "../contexts/AuthContext";

export const useUserPermission = () => {
    const { hasPermission } = usePermissions();
    const { currentUser } = useAuth();

    const getUserRole = () => {
        if (!currentUser) {
            return null;
        }

        // Check direct role property
        if (currentUser.role) {
            return currentUser.role;
        }

        // Check nested role property
        if (currentUser.data?.role) {
            return currentUser.data.role;
        }

        // Check other possible role properties
        if (currentUser.appUserRole) {
            // Map numeric roles to string roles if needed
            const roleMap = {
                2: "employee",
                3: "manager",
                5: "admin",
            };
            return roleMap[currentUser.appUserRole] || "employee";
        }

        return "employee";
    };

    const role = getUserRole();

    return {
        can: (module, action) => {
            if (!role) return false;
            const result = hasPermission(role, module, action);
            return result;
        },

        checkPermission: (module, action) => {
            if (!role) return false;
            return hasPermission(role, module, action);
        },

        getRole: () => role,
    };
};
