// src/pages/app/Dashboard.jsx - UPDATED VERSION
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
    VideoCameraOutlined,
    BookOutlined,
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
    AreaChart,
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
        activeCourses: 0,
        activeWebinars: 0,
        monthlyRegistrations: 0,
        registrationTrend: 0,
        userGrowthData: [],
        userStatusData: [],
    });
    const [refreshing, setRefreshing] = useState(false);
    const [chartLoading, setChartLoading] = useState({
        userGrowth: false,
        userStatus: false,
    });

    // Individual chart date ranges
    const [chartDateRanges, setChartDateRanges] = useState({
        userGrowth: [dayjs().subtract(6, "day"), dayjs()],
        userStatus: [dayjs().subtract(6, "day"), dayjs()],
    });

    // Chart refs for downloading
    const userGrowthChartRef = useRef(null);
    const userStatusChartRef = useRef(null);

    // UPDATED: Process metrics data with new API structure
    const processMetricsData = (metricsResponse) => {
        const defaultMetrics = {
            totalUsers: 0,
            activeUsers: 0,
            inactiveUsers: 0,
            totalJobs: 0,
            activeJobs: 0,
            inactiveJobs: 0,
            jobApplications: 0,
            activeCourses: 0,
            activeWebinars: 0,
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

        // Process the new API structure
        const processedMetrics = {
            ...defaultMetrics,

            // Users data from new structure
            totalUsers: data.users?.total || 0,
            activeUsers: data.users?.Active || 0,
            inactiveUsers: data.users?.Unauthorized || 0,

            // Jobs data from new structure
            totalJobs: data.jobs?.total || 0,
            activeJobs: data.jobs?.Active || 0,
            inactiveJobs: data.jobs?.Inactive || 0,

            // Applications data
            jobApplications: data.applicationStats || 0,

            // New fields for courses and webinars
            activeCourses: data.activeCourses || 0,
            activeWebinars: data.activeWebinars || 0,

            // Keep existing fields for compatibility
            monthlyRegistrations:
                data.monthlyRegistrations || data.users?.Active || 0,
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
            activeCourses: processedMetrics.activeCourses,
            activeWebinars: processedMetrics.activeWebinars,
        });

        return processedMetrics;
    };

    // UPDATED: Convert date range to match API format
    const formatDateRangeForAPI = (dateRange) => {
        if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
            const fallback = {
                from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
                to: dayjs().format("YYYY-MM-DD"),
            };
            console.log("Using fallback date range for API:", fallback);
            return fallback;
        }

        const startDate = dateRange[0];
        const endDate = dateRange[1];

        const apiFormat = {
            from: startDate.format("YYYY-MM-DD"),
            to: endDate.format("YYYY-MM-DD"),
        };

        console.log("📅 Date range formatted for API:", apiFormat);
        return apiFormat;
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

    // UPDATED: Main data fetching function with simplified chart data fetching
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

            // Fetch chart data in parallel (removed job category)
            const [chartResponse, userStatusResponse] = await Promise.all([
                api
                    .getDashboardChart(
                        formatDateRangeForAPI(chartDateRanges.userGrowth)
                    )
                    .catch((err) => {
                        console.warn("⚠️ Chart data fetch failed:", err);
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
                userStatusResponse,
            });

            // Process chart data
            const processedUserStatusData =
                processUserStatusData(userStatusResponse);

            // Combine all data
            const combinedData = {
                ...processedMetrics,
                userGrowthData:
                    chartResponse.data || chartResponse.userGrowthData || [],
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

    // UPDATED: Update individual chart data (removed job category)
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

    // UPDATED: Statistics cards with new structure
    const statisticCards = [
        {
            title: "Users",
            value: dashboardData.totalUsers,
            icon: <UserOutlined />,
            color: "#04248c",
            bgColor: "#f0f4ff",
            stats: [
                {
                    label: "Active",
                    value: dashboardData.activeUsers,
                    color: "#52c41a",
                },
                {
                    label: "Unauthorized",
                    value: dashboardData.inactiveUsers,
                    color: "#ff4d4f",
                },
            ],
        },
        {
            title: "Jobs",
            value: dashboardData.totalJobs,
            icon: <InboxOutlined />,
            color: "#52c41a",
            bgColor: "#f6ffed",
            stats: [
                {
                    label: "Active",
                    value: dashboardData.activeJobs,
                    color: "#52c41a",
                },
                {
                    label: "Inactive",
                    value: dashboardData.inactiveJobs,
                    color: "#ff4d4f",
                },
            ],
        },
        {
            title: "Content",
            value: dashboardData.activeWebinars + dashboardData.activeCourses,
            icon: <VideoCameraOutlined />,
            color: "#722ed1",
            bgColor: "#f9f0ff",
            // subtitle: "Webinars",
            stats: [
                {
                    label: "Webinars",
                    value: dashboardData.activeWebinars,
                    color: "#722ed1",
                },
                {
                    label: "Courses",
                    value: dashboardData.activeCourses,
                    color: "#722ed1",
                },
            ],
        },
        {
            title: "Applications",
            value: dashboardData.jobApplications,
            icon: <FileTextOutlined />,
            color: "#fa8c16",
            bgColor: "#fff7e6",
            subtitle: "Total Received",
            stats: [],
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

            {/* UPDATED: Statistics Cards with new design */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 20,
                    marginBottom: 32,
                }}
            >
                {statisticCards.map((stat, index) => (
                    <Card
                        key={index}
                        hoverable
                        className="dashboard-stat-card"
                        style={{
                            borderRadius: 12,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            border: "none",
                            overflow: "hidden",
                            position: "relative",
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div style={{ padding: "24px" }}>
                            {/* Header with icon and title */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "16px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "10px",
                                            backgroundColor: stat.bgColor,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "18px",
                                            color: stat.color,
                                        }}
                                    >
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 500,
                                                color: "#262626",
                                                marginBottom: "2px",
                                            }}
                                        >
                                            {stat.title}
                                        </div>
                                        {stat.subtitle && (
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#8c8c8c",
                                                }}
                                            >
                                                {stat.subtitle}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main value */}
                            <div
                                style={{
                                    fontSize: "32px",
                                    fontWeight: 700,
                                    color: stat.color,
                                    lineHeight: 1,
                                    marginBottom: "16px",
                                }}
                            >
                                {stat.value.toLocaleString()}
                            </div>

                            {/* Stats breakdown */}
                            {stat.stats && stat.stats.length > 0 && (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "16px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {stat.stats.map((subStat, subIndex) => (
                                        <div
                                            key={subIndex}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "6px 12px",
                                                backgroundColor: "#fafafa",
                                                borderRadius: "6px",
                                                border: `1px solid ${subStat.color}20`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "50%",
                                                    backgroundColor:
                                                        subStat.color,
                                                }}
                                            ></div>
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#595959",
                                                    marginRight: "4px",
                                                }}
                                            >
                                                {subStat.label}:
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color: subStat.color,
                                                }}
                                            >
                                                {subStat.value.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Decorative element */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: "60px",
                                height: "60px",
                                background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                                borderBottomLeft: "60px solid transparent",
                                borderTop: `60px solid ${stat.color}10`,
                            }}
                        ></div>
                    </Card>
                ))}
            </div>

            <Divider />

            {/* UPDATED: Charts Section - Only 2 charts now */}
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
