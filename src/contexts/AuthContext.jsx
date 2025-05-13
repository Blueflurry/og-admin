// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAPI } from "../hooks/useAPI"; // Import your API hook

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { api } = useAPI(); // Use your API hook

    // Check for user in localStorage on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const userData = JSON.parse(storedUser);

            setCurrentUser(userData);
        }
        setLoading(false);
    }, []);

    // Login function using actual API
    const login = async (email, password) => {
        try {
            const response = await api.login(email, password);

            // Check if we have a valid response with user data
            if (response && response.data) {
                const userData = response.data.user;

                // Store user in localStorage
                localStorage.setItem("user", JSON.stringify(userData));
                setCurrentUser(userData);
                return userData;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error; // Re-throw the error so the login component can handle it
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("user");
        setCurrentUser(null);
    };

    // Context value
    const value = {
        currentUser,
        login,
        logout,
        loading,
    };

    // Only render children when not loading
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
