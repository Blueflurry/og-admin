import Users from "./pages/app/users";
import Jobs from "./pages/app/jobs"; // Add this import
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import AuthLayout from "./layouts/auth";
import AppLayout from "./layouts/app";

const appRoutes = [
    {
        path: "/auth/",
        element: <AuthLayout />,
        children: [
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "signup",
                element: <Signup />,
            },
        ],
    },
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                path: "users",
                element: <Users />,
            },
            {
                path: "jobs", // Add this route
                element: <Jobs />,
            },
        ],
    },
];

export default appRoutes;
