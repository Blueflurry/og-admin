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
import Institutes from "./pages/app/institutes";
import ManageOptins from "./pages/app/manageOptins";
import Notifications from "./pages/app/notifications";
import Referrals from "./pages/app/referrals";
import ReferralCourses from "./pages/app/referralCourses";
// import ManageEmployees from "./pages/app/manageEmployees";
import Dashboard from "./pages/app/Dashboard";
import JobApplications from "./pages/app/jobApplications";
import Carousels from "./pages/app/carousels";
import Categories from "./pages/app/categories";
import AllJobApplications from "./pages/app/allJobApplications";

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
                element: <Dashboard />,
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
                path: paths.categories,
                element: (
                    <PrivateRoute module="categories" action="view">
                        <Categories />
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
                path: paths.allJobApplications,
                element: (
                    <PrivateRoute module="jobApplications" action="view">
                        <AllJobApplications />
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
                path: paths.notifications,
                element: (
                    <PrivateRoute module="notifications" action="view">
                        <Notifications />
                    </PrivateRoute>
                ),
            },

            {
                path: paths.referrals,
                element: (
                    <PrivateRoute module="referrals" action="view">
                        <Referrals />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.referralCourses,
                element: (
                    <PrivateRoute module="referralCourses" action="view">
                        <ReferralCourses />
                    </PrivateRoute>
                ),
            },

            // {
            //     path: paths.manageEmployess,
            //     element: (
            //         <PrivateRoute module="employees" action="view">
            //             <ManageEmployees />
            //         </PrivateRoute>
            //     ),
            // },

            {
                path: paths.manageCompanies,
                element: (
                    <PrivateRoute module="companies" action="view">
                        <ManageCompanies />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.manageInstitutes,
                element: (
                    <PrivateRoute module="institutes" action="view">
                        <Institutes />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.manageOptins,
                element: (
                    <PrivateRoute module="optins" action="view">
                        <ManageOptins />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.carousels,
                element: (
                    <PrivateRoute module="carousels" action="view">
                        <Carousels />
                    </PrivateRoute>
                ),
            },
            {
                path: paths.jobApplications,
                element: (
                    <PrivateRoute module="jobApplications" action="view">
                        <JobApplications />
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
