import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import JobTable from "../../components/JobTableComponent/JobTable";
import { Card } from "antd";

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

            setJobs(data.data.docs || []);

            // Update pagination with current values
            setPagination({
                page: page,
                limit: limit,
                sort: sort,
                totalDocs: data.data.pagination?.totalDocs || 0,
                ...data.data.pagination,
            });
        } catch (err) {
            console.error("Error fetching jobs:", err);
        }
    };

    const handleUpdateRecords = (newRecords) => {
        // setUpdateRecords(newRecords);
        setUpdateRecords((prevRecords) => ({
            ...prevRecords, // Merge with previous state
            ...newRecords,
        }));
    };

    // if (isLoading && jobs.length === 0) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;

    return (
        <Card title="Manage Jobs" loading={isLoading && jobs.length === 0}>
            <JobTable
                jobData={jobs}
                pagination={pagination}
                setUpdateRecords={handleUpdateRecords}
            />
        </Card>
    );
};

export default Jobs;
