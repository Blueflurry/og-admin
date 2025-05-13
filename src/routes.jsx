// routes.jsx
import Users from "./pages/app/users";
import Jobs from "./pages/app/jobs";
import Login from "./pages/auth/login";
import AuthLayout from "./layouts/auth";
import AppLayout from "./layouts/app";
import Courses from "./pages/app/courses";
import Webinars from "./pages/app/webinars";
import ProtectedLayout from "./components/ProtectedLayout";
import PrivateRoute from "./components/PrivateRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import paths from "./constants/appUrls";
import ManageCompanies from "./pages/app/manageCompanies";

const appRoutes = [
    {
        path: paths.auth,
        element: <AuthLayout />,
        children: [
            {
                path: paths.login,
                element: <Login />,
            },
        ],
    },
    {
        path: "/",
        element: (
            <ProtectedLayout>
                <AppLayout />
            </ProtectedLayout>
        ),
        children: [
            {
                path: "",
                element: <div>Dashboard</div>,
            },
            {
                path: paths.users,
                element: (
                    <PrivateRoute module="users" action="view">
                        <Users />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.jobs,
                element: (
                    <PrivateRoute module="jobs" action="view">
                        <Jobs />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.courses,
                element: (
                    <PrivateRoute module="courses" action="view">
                        <Courses />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.webinars,
                element: (
                    <PrivateRoute module="webinars" action="view">
                        <Webinars />
                    </PrivateRoute>
                ),
            },

            {
                path: paths.manageCompanies,
                element: (
                    <PrivateRoute module="companies" permission="view">
                        <ManageCompanies />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.unauthorized,
                element: <UnauthorizedPage />,
            },
        ],
    },
];

export default appRoutes;
