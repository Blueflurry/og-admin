// src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import appRoutes from "./routes";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";

const App = () => {
    const router = createBrowserRouter(appRoutes);

    return (
        <AuthProvider>
            <PermissionsProvider>
                <RouterProvider router={router} />
            </PermissionsProvider>
        </AuthProvider>
    );
};

export default App;
