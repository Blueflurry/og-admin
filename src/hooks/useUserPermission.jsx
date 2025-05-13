// src/hooks/useUserPermission.jsx
import { useContext } from "react";
import { usePermissions } from "../contexts/PermissionsContext";
import { useAuth } from "../contexts/AuthContext";

export const useUserPermission = () => {
    const { hasPermission } = usePermissions();
    const { currentUser } = useAuth();

    // Determine the role from your API response structure
    // Adjust this based on your actual API response structure
    const getUserRole = () => {
        if (!currentUser) return null;

        // If your API returns a role property directly
        if (currentUser.role) {
            // console.log(currentUser.role);
            return currentUser.role;
        }

        // If your API returns a different property for role, adjust accordingly
        // For example, if it's in currentUser.data.role
        if (currentUser.data?.role) {
            return currentUser.data.role;
        }

        // Default to 'employee' if no role is found
        return "employee";
    };

    const role = getUserRole();

    return {
        // Check if current user has permission
        can: (module, action) => {
            if (!role) return false;
            return hasPermission(role, module, action);
        },

        // For protected routes
        checkPermission: (module, action) => {
            if (!role) return false;
            return hasPermission(role, module, action);
        },

        // Get current user role
        getRole: () => role,
    };
};
