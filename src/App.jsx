import { useEffect, useState } from "react";
import { useAPI } from "./hooks/useAPI";

function App() {
    const { api, isLoading, error, resetError } = useAPI();
    const [users, setUsers] = useState([]);

    useEffect(() => api.getUsers().then((data) => setUsers(data)), []);
    useEffect(() => api.getUserById().then((data) => setUsers(data)), []);
    useEffect(() => api.getUsers().then((data) => setUsers(data)), []);
    useEffect(() => api.getUserById().then((data) => setUsers(data)), []);

    return <>hello world</>;
}

export default App;
