// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserPermission } from "../hooks/useUserPermission";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an AuthContext

// TEMPORARY DEBUG VERSION - Use this first to see what values you're getting

const PrivateRoute = ({ children, module, action }) => {
    // console.log("🚨 DEBUG - PrivateRoute called with:", { module, action });

    try {
        // Get auth context directly
        const authContext = useAuth();
        // console.log("🚨 DEBUG - Auth context:", authContext);

        // Get permission hook
        const permissionHook = useUserPermission();
        // console.log("🚨 DEBUG - Permission hook:", permissionHook);

        // Extract values
        const currentUser = authContext.currentUser;
        const isAuthenticated = authContext.isAuthenticated;
        const can = permissionHook.can;

        // console.log("🚨 DEBUG - Extracted values:", {
        //     currentUser: currentUser,
        //     isAuthenticated: isAuthenticated,
        //     hasCanFunction: typeof can === "function",
        //     token: localStorage.getItem("token"),
        // });

        // Check authentication
        const userAuthenticated = isAuthenticated || !!currentUser;
        // console.log("🚨 DEBUG - Authentication result:", userAuthenticated);

        // if (!userAuthenticated) {
        //     return (
        //         <div
        //             style={{
        //                 padding: "20px",
        //                 background: "red",
        //                 color: "white",
        //             }}
        //         >
        //             <h2>DEBUG: Authentication Failed</h2>
        //             <p>currentUser: {JSON.stringify(currentUser)}</p>
        //             <p>isAuthenticated: {String(isAuthenticated)}</p>
        //             <p>token exists: {!!localStorage.getItem("token")}</p>
        //             <p>userAuthenticated: {String(userAuthenticated)}</p>
        //         </div>
        //     );
        // }

        // Check permissions
        let hasPermission = false;
        try {
            hasPermission = can(module, action);
        } catch (permError) {
            console.error("🚨 DEBUG - Permission check error:", permError);
            return (
                <div
                    style={{
                        padding: "20px",
                        background: "purple",
                        color: "white",
                    }}
                >
                    <h2>DEBUG: Permission Check Error</h2>
                    <p>Error: {permError.message}</p>
                    <p>Module: {module}</p>
                    <p>Action: {action}</p>
                </div>
            );
        }

        console.log("🚨 DEBUG - Permission result:", {
            module,
            action,
            hasPermission,
        });

        if (!hasPermission) {
            return (
                <div
                    style={{
                        padding: "20px",
                        background: "orange",
                        color: "white",
                    }}
                >
                    <h2>DEBUG: Permission Denied</h2>
                    <p>Module: {module}</p>
                    <p>Action: {action}</p>
                    <p>User role: {permissionHook.getRole()}</p>
                    <p>Has permission: {String(hasPermission)}</p>
                </div>
            );
        }

        // Success
        return (
            <div>
                <div
                    style={{
                        padding: "10px",
                        background: "green",
                        color: "white",
                        marginBottom: "10px",
                    }}
                >
                    <strong>DEBUG: Access Granted!</strong>
                    <br />
                    User role: {permissionHook.getRole()}
                    <br />
                    Module: {module}, Action: {action}
                </div>
                {children}
            </div>
        );
    } catch (error) {
        console.error("🚨 DEBUG - PrivateRoute error:", error);
        return (
            <div
                style={{
                    padding: "20px",
                    background: "purple",
                    color: "white",
                }}
            >
                <h2>DEBUG: PrivateRoute Error</h2>
                <p>Error: {error.message}</p>
                <p>Stack: {error.stack}</p>
            </div>
        );
    }
};

export default PrivateRoute;
