// src/pages/app/referrals.jsx
import { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { Card, message, Spin } from "antd";
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

    // Dashboard-like loading state
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchReferrals();
    }, [updateRecords]);

    const fetchReferrals = async () => {
        try {
            setRefreshing(true);
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
            message.error("Failed to fetch referrals");
        } finally {
            setRefreshing(false);
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

            {/* Global Loading Overlay */}
            {refreshing && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 999,
                    }}
                >
                    <Spin size="large" tip="Loading referrals data..." />
                </div>
            )}
        </Card>
    );
};

export default Referrals;
