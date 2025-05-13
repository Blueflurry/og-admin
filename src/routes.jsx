import Users from "./pages/app/users";
import Jobs from "./pages/app/jobs"; // Add this import
import Login from "./pages/auth/login";
import AuthLayout from "./layouts/auth";
import AppLayout from "./layouts/app";
import Courses from "./pages/app/courses";
import Webinars from "./pages/app/webinars";

const appRoutes = [
    {
        path: "/auth/",
        element: <AuthLayout />,
        children: [
            {
                path: "login",
                element: <Login />,
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
                path: "jobs",
                element: <Jobs />,
            },
            {
                path: "courses",
                element: <Courses />,
            },
            {
                path: "webinars",
                element: <Webinars />,
            },
        ],
    },
];

export default appRoutes;
