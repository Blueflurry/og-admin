// src/pages/app/referrals.jsx
import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message } from "antd";
import ReferralsTable from "../../components/ReferralsTableComponent/ReferralsTable";
import ReferralsFormDrawer from "../../components/ReferralsTableComponent/ReferralsFormDrawer";
import ReferralsViewDrawer from "../../components/ReferralsTableComponent/ReferralsViewDrawer";

const Referrals = () => {
    const { api, isLoading, error } = useAPI();
    const [referrals, setReferrals] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0,
    });
    const [updateRecords, setUpdateRecords] = useState({
        page: 1,
        limit: 10,
        sort: "-createdAt",
        filters: {},
    });

    // State for drawers
    const [formDrawerOpen, setFormDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState(null);

    useEffect(() => {
        fetchReferrals();
    }, [updateRecords]);

    const fetchReferrals = async () => {
        try {
            const { page, limit, sort, filters = {} } = updateRecords;

            const data = await api.getReferrals(page, limit, sort, filters);

            setReferrals(data.data.docs || []);
            setPagination({
                page: updateRecords.page,
                limit: updateRecords.limit,
                totalDocs: data.data.totalDocs || 0,
                ...data.data,
            });
        } catch (err) {
            console.error("Error fetching referrals:", err);
            message.error("Failed to fetch referrals");
        }
    };

    // Handlers for CRUD operations
    const handleCreate = () => {
        setSelectedReferral(null);
        setFormDrawerOpen(true);
    };

    const handleEdit = (referral) => {
        setSelectedReferral(referral);
        setFormDrawerOpen(true);
    };

    const handleView = (referral) => {
        setSelectedReferral(referral);
        setViewDrawerOpen(true);
    };

    const handleDelete = async (referral) => {
        try {
            const referralId = referral.id || referral._id;
            await api.deleteReferral(referralId);
            message.success("Referral deleted successfully");
            fetchReferrals();
        } catch (error) {
            console.error("Error deleting referral:", error);
            message.error("Failed to delete referral");
        }
    };

    const handleFormSuccess = () => {
        fetchReferrals();
        setFormDrawerOpen(false);
    };

    return (
        <Card
            title="Manage Referrals"
            loading={isLoading && referrals.length === 0}
        >
            <ReferralsTable
                referralData={referrals}
                pagination={pagination}
                setUpdateRecords={setUpdateRecords}
                handleView={handleView}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                onCreateNew={handleCreate}
            />

            <ReferralsFormDrawer
                open={formDrawerOpen}
                onClose={() => setFormDrawerOpen(false)}
                initialValues={selectedReferral}
                onSuccess={handleFormSuccess}
            />

            <ReferralsViewDrawer
                open={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                referralData={selectedReferral}
            />
        </Card>
    );
};

export default Referrals;
