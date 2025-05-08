import { createBrowserRouter, RouterProvider } from "react-router-dom";
import appRoutes from "./routes";
import "./index.css";

const App = () => {
    const router = createBrowserRouter(appRoutes);

    return <RouterProvider router={router} />;
};

export default App;
