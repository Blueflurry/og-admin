import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import JobTable from "../../components/JobTableComponent/JobTable";

const Jobs = () => {
    const { api, isLoading, error, resetError } = useAPI();
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "",
        filters: {},
    });

    useEffect(() => {
        fetchJobs();
    }, [updateRecords]);

    const fetchJobs = async () => {
        try {
            // Extract filters and sort from updateRecords
            const { page, limit, sort, filters = {} } = updateRecords;

            const data = await api.getJobs(page, limit, sort, filters);

            // console.log("Jobs data:", data);
            setJobs(data.data.docs || []);

            // Update pagination with current values
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                sort: updateRecords.sort,
                totalDocs: data.data.pagination?.totalDocs || 0,
                ...data.data.pagination,
            });
        } catch (err) {
            console.error("Error fetching jobs:", err);
        }
    };

    const handleUpdateRecords = (newRecords) => {
        // console.log("Updating records with:", newRecords);
        setUpdateRecords(newRecords);
    };

    if (isLoading && jobs.length === 0) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <JobTable
                jobData={jobs}
                pagination={pagination}
                setUpdateRecords={handleUpdateRecords}
            />
        </div>
    );
};

export default Jobs;
