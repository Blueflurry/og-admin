import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import JobTable from "../../components/JobTableComponent/JobTable";

const Jobs = () => {
    const { api, isLoading, error, resetError } = useAPI();
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "",
    });

    useEffect(() => {
        fetchJobs();
    }, [updateRecords]);

    const fetchJobs = async () => {
        try {
            const data = await api.getJobs(
                updateRecords.page,
                updateRecords.limit,
                updateRecords.sort
            );
            console.log("Jobs data:", data);
            setJobs(data.data.docs || []);
            setPagination(data.data.pagination || {});
        } catch (err) {
            console.error("Error fetching jobs:", err);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <JobTable
                jobData={jobs}
                pagination={pagination}
                setUpdateRecords={setUpdateRecords}
            />
        </div>
    );
};

export default Jobs;
