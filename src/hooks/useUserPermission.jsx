// src/hooks/useUserPermission.jsx
import { useContext } from "react";
import { usePermissions } from "../contexts/PermissionsContext";
import { useAuth } from "../contexts/AuthContext";

export const useUserPermission = () => {
    const { hasPermission } = usePermissions();
    const { currentUser } = useAuth();

    // ADD DEBUG LOGGING
    console.log("🎭 ROLE DEBUG - currentUser:", currentUser);

    const getUserRole = () => {
        if (!currentUser) {
            console.log("🎭 ROLE DEBUG - No currentUser");
            return null;
        }

        // Check direct role property
        if (currentUser.role) {
            console.log("🎭 ROLE DEBUG - Found role:", currentUser.role);
            return currentUser.role;
        }

        // Check nested role property
        if (currentUser.data?.role) {
            console.log(
                "🎭 ROLE DEBUG - Found nested role:",
                currentUser.data.role
            );
            return currentUser.data.role;
        }

        // Check other possible role properties
        if (currentUser.appUserRole) {
            console.log(
                "🎭 ROLE DEBUG - Found appUserRole:",
                currentUser.appUserRole
            );
            // Map numeric roles to string roles if needed
            const roleMap = {
                2: "employee",
                3: "manager",
                5: "admin",
            };
            return roleMap[currentUser.appUserRole] || "employee";
        }

        console.log("🎭 ROLE DEBUG - No role found, defaulting to employee");
        return "employee";
    };

    const role = getUserRole();
    console.log("🎭 ROLE DEBUG - Final role:", role);

    // Test permission check
    console.log(
        "🎭 ROLE DEBUG - Testing jobApplications view permission:",
        hasPermission(role, "jobApplications", "view")
    );

    return {
        can: (module, action) => {
            console.log("🎭 PERMISSION CHECK:", { role, module, action });
            if (!role) return false;
            const result = hasPermission(role, module, action);
            console.log("🎭 PERMISSION RESULT:", result);
            return result;
        },

        checkPermission: (module, action) => {
            if (!role) return false;
            return hasPermission(role, module, action);
        },

        getRole: () => role,
    };
};
