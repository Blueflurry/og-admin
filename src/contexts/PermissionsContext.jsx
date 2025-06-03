import React, { createContext, useContext } from "react";

// Static permissions by role - hardcoded in the code
const staticPermissions = {
    admin: {
        users: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        jobs: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        courses: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        webinars: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        notifications: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        referrals: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        optins: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        employees: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        companies: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        institutes: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        carousels: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
        jobApplications: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            bulkdownload: true,
        },
    },
    manager: {
        users: {
            view: true,
            create: false,
            edit: true,
            delete: false,
            bulkdownload: true,
        },
        jobs: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            bulkdownload: true,
        },
        courses: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            bulkdownload: true,
        },
        webinars: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            bulkdownload: true,
        },
        notifications: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            bulkdownload: true,
        },
        referrals: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            bulkdownload: true,
        },
        optins: {
            view: false,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        employees: {
            view: false,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        companies: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: true,
        },
        institutes: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: true,
        },

        carousels: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            bulkdownload: true,
        },
        jobApplications: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            bulkdownload: true,
        },
    },
    employee: {
        users: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        jobs: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        courses: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        webinars: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        notifications: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        referrals: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        optins: {
            view: false,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        employees: {
            view: false,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        companies: {
            view: false,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        institutes: {
            view: false,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        carousels: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
        jobApplications: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            bulkdownload: false,
        },
    },
};

const PermissionsContext = createContext();

export const usePermissions = () => useContext(PermissionsContext);

export const PermissionsProvider = ({ children }) => {
    // Check if a user has permission
    const hasPermission = (role, module, action) => {
        if (!role || !module || !action) return false;
        return staticPermissions[role]?.[module]?.[action] || false;
    };

    const value = {
        permissions: staticPermissions,
        hasPermission,
    };

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
};
