// src/pages/app/Dashboard.jsx - FIXED VERSION
import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Spin,
    message,
    Space,
    Divider,
    Button,
    DatePicker,
    Dropdown,
} from "antd";
import {
    UserOutlined,
    TeamOutlined,
    InboxOutlined,
    FileTextOutlined,
    RiseOutlined,
    FallOutlined,
    ReloadOutlined,
    DownloadOutlined,
    CalendarOutlined,
    DownOutlined,
} from "@ant-design/icons";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useAPI } from "../../hooks/useAPI";
import Papa from "papaparse";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Color palette for charts
const COLORS = [
    "#04248c",
    "#52c41a",
    "#fa8c16",
    "#1890ff",
    "#722ed1",
    "#13c2c2",
];

const Dashboard = () => {
    const { api, isLoading } = useAPI();
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalJobs: 0,
        activeJobs: 0,
        inactiveJobs: 0,
        jobApplications: 0,
        monthlyRegistrations: 0,
        registrationTrend: 0,
        userGrowthData: [],
        jobCategoryData: [],
        userStatusData: [],
    });
    const [refreshing, setRefreshing] = useState(false);
    const [chartLoading, setChartLoading] = useState({
        userGrowth: false,
        jobCategory: false,
        userStatus: false,
    });

    // Individual chart date ranges
    const [chartDateRanges, setChartDateRanges] = useState({
        userGrowth: [dayjs().subtract(6, "day"), dayjs()],
        jobCategory: [dayjs().subtract(6, "day"), dayjs()],
        userStatus: [dayjs().subtract(6, "day"), dayjs()],
    });

    // Chart refs for downloading
    const userGrowthChartRef = useRef(null);
    const jobCategoryChartRef = useRef(null);
    const userStatusChartRef = useRef(null);

    // FIXED: Process metrics data with better error handling and logging
    const processMetricsData = (metricsResponse) => {
        const defaultMetrics = {
            totalUsers: 0,
            activeUsers: 0,
            inactiveUsers: 0,
            totalJobs: 0,
            activeJobs: 0,
            inactiveJobs: 0,
            jobApplications: 0,
            monthlyRegistrations: 0,
            registrationTrend: 0,
        };

        console.log("🔍 Raw metrics response:", metricsResponse);

        if (!metricsResponse || !metricsResponse.data) {
            console.warn("❌ No metrics response or data received");
            message.warning("No dashboard metrics data received from server");
            return defaultMetrics;
        }

        const data = metricsResponse.data;
        console.log("🔍 Extracted metrics data:", data);

        // More flexible data extraction - try multiple possible field names
        const processedMetrics = {
            ...defaultMetrics,

            // Users data - try multiple possible field structures
            totalUsers:
                data.users?.total ||
                data.totalUsers ||
                data.userStats?.total ||
                (data.users?.Active || 0) + (data.users?.Unauthorized || 0) ||
                0,

            activeUsers:
                data.users?.Active ||
                data.users?.active ||
                data.activeUsers ||
                data.userStats?.active ||
                0,

            inactiveUsers:
                data.users?.Unauthorized ||
                data.users?.inactive ||
                data.users?.Inactive ||
                data.inactiveUsers ||
                data.userStats?.inactive ||
                0,

            // Jobs data - try multiple possible field structures
            totalJobs:
                data.jobs?.total ||
                data.totalJobs ||
                data.jobStats?.total ||
                (data.jobs?.Active || 0) + (data.jobs?.Inactive || 0) ||
                0,

            activeJobs:
                data.jobs?.Active ||
                data.jobs?.active ||
                data.activeJobs ||
                data.jobStats?.active ||
                0,

            inactiveJobs:
                data.jobs?.Inactive ||
                data.jobs?.inactive ||
                data.inactiveJobs ||
                data.jobStats?.inactive ||
                (data.jobs?.total || 0) - (data.jobs?.Active || 0) ||
                0,

            // Applications data - try multiple possible field names
            jobApplications:
                data.applicationStats ||
                data.applications ||
                data.jobApplications ||
                data.totalApplications ||
                0,

            // Monthly registrations - use active users as fallback
            monthlyRegistrations:
                data.monthlyRegistrations ||
                data.users?.Active ||
                data.activeUsers ||
                0,

            // Trend data
            registrationTrend: data.registrationTrend || data.trend || 0,
        };

        console.log("✅ Processed metrics:", processedMetrics);
        console.log("📊 Card values that will be displayed:", {
            totalUsers: processedMetrics.totalUsers,
            activeUsers: processedMetrics.activeUsers,
            inactiveUsers: processedMetrics.inactiveUsers,
            totalJobs: processedMetrics.totalJobs,
            activeJobs: processedMetrics.activeJobs,
            inactiveJobs: processedMetrics.inactiveJobs,
            jobApplications: processedMetrics.jobApplications,
        });

        return processedMetrics;
    };

    // FIXED: Convert date range to match API format (YYYY-MM-DD instead of DD/MM/YYYY)
    const formatDateRangeForAPI = (dateRange) => {
        if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
            const fallback = {
                from: dayjs().subtract(6, "day").format("YYYY-MM-DD"), // FIXED: Use YYYY-MM-DD
                to: dayjs().format("YYYY-MM-DD"), // FIXED: Use YYYY-MM-DD
            };
            console.log("Using fallback date range for API:", fallback);
            return fallback;
        }

        const startDate = dateRange[0];
        const endDate = dateRange[1];

        const apiFormat = {
            from: startDate.format("YYYY-MM-DD"), // FIXED: Use YYYY-MM-DD format
            to: endDate.format("YYYY-MM-DD"), // FIXED: Use YYYY-MM-DD format
        };

        console.log("📅 Date range formatted for API:", apiFormat);
        return apiFormat;
    };

    // Process job category data
    const processJobCategoryData = (jobStatsResponse) => {
        console.log("🔍 Raw job category response:", jobStatsResponse);

        if (
            !jobStatsResponse ||
            !jobStatsResponse.data ||
            !Array.isArray(jobStatsResponse.data)
        ) {
            console.warn("❌ Invalid job category data structure");
            return [];
        }

        return jobStatsResponse.data.map((categoryData) => {
            const category =
                categoryData.category || categoryData.name || "Unknown";
            let active = 0;
            let inactive = 0;

            if (categoryData.stats && Array.isArray(categoryData.stats)) {
                categoryData.stats.forEach((stat) => {
                    if (stat.status === 1) {
                        active = stat.count || 0;
                    } else if (stat.status === -1 || stat.status === 0) {
                        inactive += stat.count || 0;
                    }
                });
            } else {
                // Try direct properties
                active = categoryData.active || categoryData.Active || 0;
                inactive = categoryData.inactive || categoryData.Inactive || 0;
            }

            return {
                category,
                active,
                inactive,
                total:
                    categoryData.totalJobs ||
                    categoryData.total ||
                    active + inactive,
            };
        });
    };

    // Process user status data
    const processUserStatusData = (userStatsResponse) => {
        console.log("🔍 Raw user status response:", userStatsResponse);

        if (
            !userStatsResponse ||
            !userStatsResponse.data ||
            !Array.isArray(userStatsResponse.data)
        ) {
            console.warn("❌ Invalid user status data structure");
            return [];
        }

        return userStatsResponse.data.map((statusData) => ({
            name:
                statusData.label ||
                statusData.name ||
                statusData.status ||
                "Unknown",
            value: statusData.count || statusData.value || 0,
        }));
    };

    // FIXED: Main data fetching function with better error handling
    const fetchDashboardData = async () => {
        try {
            console.log("🔄 Starting dashboard data fetch...");
            setRefreshing(true);

            // Fetch metrics data (no time range needed)
            console.log("📡 Fetching dashboard metrics...");
            const metricsResponse = await api.getDashboardMetrics();
            console.log("✅ Metrics response received:", metricsResponse);

            // Process metrics data
            const processedMetrics = processMetricsData(metricsResponse);

            // Fetch chart data in parallel
            const [chartResponse, jobCategoryResponse, userStatusResponse] =
                await Promise.all([
                    api
                        .getDashboardChart(
                            formatDateRangeForAPI(chartDateRanges.userGrowth)
                        )
                        .catch((err) => {
                            console.warn("⚠️ Chart data fetch failed:", err);
                            return { data: [] };
                        }),
                    (api.getJobCategoryStats
                        ? api.getJobCategoryStats(
                              formatDateRangeForAPI(chartDateRanges.jobCategory)
                          )
                        : Promise.resolve({ data: [] })
                    ).catch((err) => {
                        console.warn("⚠️ Job category data fetch failed:", err);
                        return { data: [] };
                    }),
                    (api.getUserStatusStats
                        ? api.getUserStatusStats(
                              formatDateRangeForAPI(chartDateRanges.userStatus)
                          )
                        : Promise.resolve({ data: [] })
                    ).catch((err) => {
                        console.warn("⚠️ User status data fetch failed:", err);
                        return { data: [] };
                    }),
                ]);

            console.log("📊 Chart responses:", {
                chartResponse,
                jobCategoryResponse,
                userStatusResponse,
            });

            // Process chart data
            const processedJobCategories =
                processJobCategoryData(jobCategoryResponse);
            const processedUserStatusData =
                processUserStatusData(userStatusResponse);

            // Combine all data
            const combinedData = {
                ...processedMetrics,
                userGrowthData:
                    chartResponse.data || chartResponse.userGrowthData || [],
                jobCategoryData: processedJobCategories,
                userStatusData: processedUserStatusData,
            };

            console.log("🎯 Final combined dashboard data:", combinedData);
            setDashboardData(combinedData);

            message.success("Dashboard data loaded successfully");
        } catch (error) {
            console.error("❌ Error fetching dashboard data:", error);

            // Show specific error message
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Unknown error";
            message.error(`Failed to load dashboard data: ${errorMessage}`);

            // Log the full error for debugging
            console.error("Full error details:", {
                error,
                response: error.response,
                data: error.response?.data,
            });
        } finally {
            setRefreshing(false);
        }
    };

    // Update individual chart data
    const updateChartData = async (chartType, newDateRange) => {
        try {
            if (
                !newDateRange ||
                !Array.isArray(newDateRange) ||
                newDateRange.length !== 2
            ) {
                console.error("Invalid date range provided to updateChartData");
                return;
            }

            console.log(`🔄 Updating ${chartType} chart data...`);

            setChartLoading((prev) => ({
                ...prev,
                [chartType]: true,
            }));

            let updatedData = {};
            const dateRangeForAPI = formatDateRangeForAPI(newDateRange);

            if (chartType === "userGrowth") {
                const chartData = await api.getDashboardChart(dateRangeForAPI);
                updatedData = {
                    userGrowthData:
                        chartData.data || chartData.userGrowthData || [],
                };
            } else if (chartType === "jobCategory") {
                if (api.getJobCategoryStats) {
                    const jobCategoryResponse = await api.getJobCategoryStats(
                        dateRangeForAPI
                    );
                    const processedJobCategories =
                        processJobCategoryData(jobCategoryResponse);
                    updatedData = { jobCategoryData: processedJobCategories };
                }
            } else if (chartType === "userStatus") {
                if (api.getUserStatusStats) {
                    const userStatusResponse = await api.getUserStatusStats(
                        dateRangeForAPI
                    );
                    const processedUserStatusData =
                        processUserStatusData(userStatusResponse);
                    updatedData = { userStatusData: processedUserStatusData };
                }
            }

            setDashboardData((prevData) => ({
                ...prevData,
                ...updatedData,
            }));

            message.success(`${chartType} chart updated successfully`);
        } catch (error) {
            console.error(`❌ Error updating ${chartType} chart:`, error);
            message.error(`Failed to update ${chartType} chart`);
        } finally {
            setChartLoading((prev) => ({
                ...prev,
                [chartType]: false,
            }));
        }
    };

    // Handle chart date range changes
    const handleChartDateRangeChange = (chartType, newDateRange) => {
        if (
            !newDateRange ||
            !Array.isArray(newDateRange) ||
            newDateRange.length !== 2
        ) {
            console.error("Invalid date range provided");
            return;
        }

        try {
            let validatedRange = newDateRange;

            if (
                !dayjs.isDayjs(newDateRange[0]) ||
                !dayjs.isDayjs(newDateRange[1])
            ) {
                validatedRange = [
                    dayjs(newDateRange[0]),
                    dayjs(newDateRange[1]),
                ];
            }

            if (!validatedRange[0].isValid() || !validatedRange[1].isValid()) {
                throw new Error("Invalid dayjs objects");
            }

            console.log(`📅 ${chartType} date range changed:`, {
                from: validatedRange[0].format("YYYY-MM-DD"),
                to: validatedRange[1].format("YYYY-MM-DD"),
            });

            setChartDateRanges((prev) => ({
                ...prev,
                [chartType]: validatedRange,
            }));

            updateChartData(chartType, validatedRange);
        } catch (error) {
            console.error("Error handling chart date range change:", error);
            message.error("Invalid date range selected");
        }
    };

    // CSV Download functions
    const downloadCSV = (data, filename) => {
        try {
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute(
                    "download",
                    `${filename}_${dayjs().format("DD-MM-YYYY")}.csv`
                );
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            message.success(`${filename} CSV downloaded successfully!`);
        } catch (error) {
            console.error("Error downloading CSV:", error);
            message.error("Failed to download CSV");
        }
    };

    const downloadUserGrowthCSV = () => {
        const csvData = dashboardData.userGrowthData.map((item) => ({
            Date: item.date || "",
            "Total Users": item.users || 0,
            "Active Users": item.activeUsers || 0,
        }));
        downloadCSV(csvData, "User_Growth_Trend");
    };

    const downloadJobCategoryCSV = () => {
        const csvData = dashboardData.jobCategoryData.map((item) => ({
            Category: item.category || "",
            "Active Jobs": item.active || 0,
            "Inactive Jobs": item.inactive || 0,
            "Total Jobs": item.total || 0,
        }));
        downloadCSV(csvData, "Jobs_by_Category");
    };

    const downloadUserStatusCSV = () => {
        const csvData = dashboardData.userStatusData.map((item) => ({
            Status: item.name || "",
            Count: item.value || 0,
        }));
        downloadCSV(csvData, "User_Status_Distribution");
    };

    // Load dashboard data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                >
                    <p style={{ margin: 0, fontWeight: 500 }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p
                            key={index}
                            style={{ margin: "5px 0", color: entry.color }}
                        >
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Date Range Picker with presets
    const DateRangePickerWithPresets = ({
        value,
        onChange,
        loading,
        chartType,
    }) => {
        const [dropdownVisible, setDropdownVisible] = useState(false);

        const handlePresetClick = (days) => {
            const end = dayjs().startOf("day");
            const start = dayjs()
                .subtract(days - 1, "day")
                .startOf("day");
            onChange(chartType, [start, end]);
            setDropdownVisible(false);
        };

        const getDisplayText = () => {
            if (value && Array.isArray(value) && value.length === 2) {
                const [start, end] = value;
                if (
                    dayjs.isDayjs(start) &&
                    dayjs.isDayjs(end) &&
                    start.isValid() &&
                    end.isValid()
                ) {
                    const daysDiff = end.diff(start, "day") + 1;
                    const today = dayjs().startOf("day");
                    const last7Start = today.subtract(6, "day");
                    const last30Start = today.subtract(29, "day");

                    if (
                        daysDiff === 7 &&
                        start.format("YYYY-MM-DD") ===
                            last7Start.format("YYYY-MM-DD")
                    ) {
                        return "Last 7 Days";
                    }
                    if (
                        daysDiff === 30 &&
                        start.format("YYYY-MM-DD") ===
                            last30Start.format("YYYY-MM-DD")
                    ) {
                        return "Last 30 Days";
                    }
                    return `${start.format("DD MMM YYYY")} - ${end.format(
                        "DD MMM YYYY"
                    )}`;
                }
            }
            return "Last 7 Days";
        };

        const handleCustomDateChange = (dates) => {
            if (dates && dates.length === 2 && dates[0] && dates[1]) {
                const cleanStart = dayjs(dates[0].format("YYYY-MM-DD"));
                const cleanEnd = dayjs(dates[1].format("YYYY-MM-DD"));
                onChange(chartType, [cleanStart, cleanEnd]);
                setDropdownVisible(false);
            }
        };

        const getRangePickerValue = () => {
            if (value && Array.isArray(value) && value.length === 2) {
                const [start, end] = value;
                if (
                    dayjs.isDayjs(start) &&
                    dayjs.isDayjs(end) &&
                    start.isValid() &&
                    end.isValid()
                ) {
                    return [start, end];
                }
            }
            return null;
        };

        const dropdownContent = (
            <div
                style={{
                    padding: "12px",
                    minWidth: "300px",
                    backgroundColor: "white",
                }}
            >
                <div style={{ marginBottom: "16px" }}>
                    <div
                        style={{
                            fontWeight: 600,
                            marginBottom: "8px",
                            fontSize: "14px",
                        }}
                    >
                        Quick Select
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                        }}
                    >
                        <Button
                            type="text"
                            block
                            size="small"
                            onClick={() => handlePresetClick(7)}
                            style={{
                                textAlign: "left",
                                justifyContent: "flex-start",
                            }}
                        >
                            Last 7 Days
                        </Button>
                        <Button
                            type="text"
                            block
                            size="small"
                            onClick={() => handlePresetClick(30)}
                            style={{
                                textAlign: "left",
                                justifyContent: "flex-start",
                            }}
                        >
                            Last 30 Days
                        </Button>
                    </div>
                </div>

                <div
                    style={{
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: "12px",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 600,
                            marginBottom: "8px",
                            fontSize: "14px",
                        }}
                    >
                        Custom Range
                    </div>
                    <RangePicker
                        value={getRangePickerValue()}
                        onChange={handleCustomDateChange}
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                        disabledDate={(current) =>
                            current && current > dayjs().endOf("day")
                        }
                        placeholder={["Start Date", "End Date"]}
                        allowClear={false}
                    />
                </div>
            </div>
        );

        return (
            <Dropdown
                dropdownRender={() => dropdownContent}
                trigger={["click"]}
                open={dropdownVisible}
                onOpenChange={setDropdownVisible}
                placement="bottomLeft"
            >
                <Button
                    icon={<CalendarOutlined />}
                    style={{ minWidth: "180px" }}
                    loading={loading}
                >
                    {getDisplayText()} <DownOutlined />
                </Button>
            </Dropdown>
        );
    };

    // Chart header component
    const ChartHeader = ({
        title,
        chartType,
        onDateRangeChange,
        onDownloadCSV,
        dateRange,
        loading = false,
    }) => (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
            }}
        >
            <Title level={5} style={{ margin: 0 }}>
                {title}
                {loading && <Spin size="small" style={{ marginLeft: 8 }} />}
            </Title>
            <Space>
                <DateRangePickerWithPresets
                    value={dateRange}
                    onChange={onDateRangeChange}
                    loading={loading}
                    chartType={chartType}
                />
                <Button
                    icon={<DownloadOutlined />}
                    onClick={onDownloadCSV}
                    size="middle"
                    title="Download CSV"
                    disabled={loading}
                >
                    CSV
                </Button>
            </Space>
        </div>
    );

    // Chart wrapper with loading overlay
    const ChartWrapper = ({ children, loading, height = 300 }) => (
        <div style={{ position: "relative", height }}>
            {loading && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                    }}
                >
                    <Spin size="large" tip="Updating chart..." />
                </div>
            )}
            {children}
        </div>
    );

    // FIXED: Statistics cards with proper data display
    const statisticCards = [
        {
            title: "Total Users",
            value: dashboardData.totalUsers,
            icon: <UserOutlined />,
            color: "#04248c",
            suffix: "users",
        },
        {
            title: "User Status",
            value: dashboardData.activeUsers,
            icon: <TeamOutlined />,
            color: "#52c41a",
            suffix: `active / ${dashboardData.inactiveUsers} unauthorized`,
            prefix: null,
        },
        {
            title: "Job Postings",
            value: dashboardData.activeJobs,
            icon: <InboxOutlined />,
            color: "#722ed1",
            suffix: `active / ${dashboardData.inactiveJobs} inactive`,
        },
        {
            title: "Job Applications",
            value: dashboardData.jobApplications,
            icon: <FileTextOutlined />,
            color: "#fa8c16",
            suffix: "applications",
        },
    ];

    return (
        <div
            style={{
                padding: "24px",
                background: "#f0f2f5",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
                <Col flex="auto">
                    <Title level={3} style={{ margin: 0, color: "#04248c" }}>
                        Dashboard Overview
                    </Title>
                    <Text type="secondary">
                        Welcome back! Here's what's happening in your platform.
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchDashboardData}
                            loading={refreshing}
                            type="primary"
                        >
                            Refresh All
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Statistics Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {statisticCards.map((stat, index) => (
                    <Card
                        key={index}
                        hoverable
                        className="dashboard-stat-card"
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                    >
                        <Statistic
                            title={
                                <Space>
                                    <span
                                        style={{
                                            color: stat.color,
                                            fontSize: 20,
                                        }}
                                    >
                                        {stat.icon}
                                    </span>
                                    <span>{stat.title}</span>
                                </Space>
                            }
                            value={stat.value}
                            suffix={
                                <Text type="secondary" style={{ fontSize: 14 }}>
                                    {stat.suffix}
                                </Text>
                            }
                            valueStyle={{ color: stat.color }}
                        />
                    </Card>
                ))}
            </div>

            <Divider />

            {/* Charts Section */}
            <Row gutter={[16, 16]}>
                {/* User Growth Line Chart */}
                <Col xs={24}>
                    <Card style={{ padding: "24px" }}>
                        <ChartHeader
                            title="User Growth Trend"
                            chartType="userGrowth"
                            onDateRangeChange={handleChartDateRangeChange}
                            onDownloadCSV={downloadUserGrowthCSV}
                            dateRange={chartDateRanges.userGrowth}
                            loading={chartLoading.userGrowth}
                        />
                        <ChartWrapper loading={chartLoading.userGrowth}>
                            <div ref={userGrowthChartRef}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={dashboardData.userGrowthData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#8c8c8c"
                                        />
                                        <YAxis stroke="#8c8c8c" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#04248c"
                                            strokeWidth={2}
                                            dot={{ fill: "#04248c", r: 4 }}
                                            activeDot={{ r: 6 }}
                                            name="Total Users"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="activeUsers"
                                            stroke="#52c41a"
                                            strokeWidth={2}
                                            dot={{ fill: "#52c41a", r: 4 }}
                                            activeDot={{ r: 6 }}
                                            name="Active Users"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartWrapper>
                    </Card>
                </Col>

                {/* Job Categories Bar Chart */}
                <Col xs={24} lg={12}>
                    <Card style={{ padding: "24px" }}>
                        <ChartHeader
                            title="Jobs by Category"
                            chartType="jobCategory"
                            onDateRangeChange={handleChartDateRangeChange}
                            onDownloadCSV={downloadJobCategoryCSV}
                            dateRange={chartDateRanges.jobCategory}
                            loading={chartLoading.jobCategory}
                        />
                        <ChartWrapper loading={chartLoading.jobCategory}>
                            <div ref={jobCategoryChartRef}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={dashboardData.jobCategoryData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis
                                            dataKey="category"
                                            stroke="#8c8c8c"
                                        />
                                        <YAxis stroke="#8c8c8c" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="active"
                                            fill="#04248c"
                                            name="Active Jobs"
                                            radius={[8, 8, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="inactive"
                                            fill="#fa8c16"
                                            name="Inactive Jobs"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartWrapper>
                    </Card>
                </Col>

                {/* User Status Pie Chart */}
                <Col xs={24} lg={12}>
                    <Card style={{ padding: "24px" }}>
                        <ChartHeader
                            title="User Status Distribution"
                            chartType="userStatus"
                            onDateRangeChange={handleChartDateRangeChange}
                            onDownloadCSV={downloadUserStatusCSV}
                            dateRange={chartDateRanges.userStatus}
                            loading={chartLoading.userStatus}
                        />
                        <ChartWrapper loading={chartLoading.userStatus}>
                            <div ref={userStatusChartRef}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={dashboardData.userStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({
                                                cx,
                                                cy,
                                                midAngle,
                                                innerRadius,
                                                outerRadius,
                                                percent,
                                            }) => {
                                                const radius =
                                                    innerRadius +
                                                    (outerRadius -
                                                        innerRadius) *
                                                        0.5;
                                                const x =
                                                    cx +
                                                    radius *
                                                        Math.cos(
                                                            -midAngle *
                                                                (Math.PI / 180)
                                                        );
                                                const y =
                                                    cy +
                                                    radius *
                                                        Math.sin(
                                                            -midAngle *
                                                                (Math.PI / 180)
                                                        );

                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill="white"
                                                        textAnchor={
                                                            x > cx
                                                                ? "start"
                                                                : "end"
                                                        }
                                                        dominantBaseline="central"
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {`${(
                                                            percent * 100
                                                        ).toFixed(0)}%`}
                                                    </text>
                                                );
                                            }}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {dashboardData.userStatusData.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            entry.name ===
                                                            "Active"
                                                                ? "#52c41a"
                                                                : "#ff4d4f"
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartWrapper>
                    </Card>
                </Col>
            </Row>

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
                    <Spin size="large" tip="Loading dashboard data..." />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
