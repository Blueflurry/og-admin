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
        unauthorisedFreeUsers: 0,
        unauthorisedAlumniUsers: 0,
        disabledUsers: 0,
        activeAlumni: 0,
        totalJobs: 0,
        activeJobs: 0,
        inactiveJobs: 0,
        jobApplications: 0,
        activeCourses: 0,
        activeWebinars: 0,
        monthlyRegistrations: 0,
        registrationTrend: 0,
        userGrowthData: [],
        jobApplicationsData: [],
    });
    const [refreshing, setRefreshing] = useState(false);
    const [chartLoading, setChartLoading] = useState({
        userGrowth: false,
        jobApplications: false,
    });

    // Individual chart date ranges
    const [chartDateRanges, setChartDateRanges] = useState({
        userGrowth: [dayjs().subtract(6, "day"), dayjs()],
        jobApplications: [dayjs().subtract(6, "day"), dayjs()],
    });

    // Chart refs for downloading
    const userGrowthChartRef = useRef(null);
    const jobApplicationsChartRef = useRef(null);

    // Process metrics data with new API structure
    const processMetricsData = (metricsResponse) => {
        const defaultMetrics = {
            totalUsers: 0,
            activeUsers: 0,
            unauthorisedAlumniUsers: 0,
            unauthorisedFreeUsers: 0,
            activeAlumni: 0,
            disabledUsers: 0,
            totalJobs: 0,
            activeJobs: 0,
            inactiveJobs: 0,
            jobApplications: 0,
            activeCourses: 0,
            activeWebinars: 0,
            monthlyRegistrations: 0,
            registrationTrend: 0,
        };

        if (!metricsResponse || !metricsResponse.data) {
            console.warn("No metrics response or data received");
            message.warning("No dashboard metrics data received from server");
            return defaultMetrics;
        }

        const data = metricsResponse.data;

        // Process the new API structure
        const processedMetrics = {
            ...defaultMetrics,

            // Users data from new structure
            totalUsers:
                data.users?.user?.active +
                    data.users?.user?.unauthorized +
                    data.users?.user?.disabled +
                    data.users?.alumni?.active +
                    data.users?.alumni?.unauthorized +
                    data.users?.alumni?.disabled || 0,
            activeUsers: data.users?.user?.active || 0,
            activeAlumni: data.users?.alumni?.active || 0,
            unauthorisedFreeUsers: data.users?.user?.unauthorized || 0,
            unauthorisedAlumniUsers: data.users?.alumni?.unauthorized || 0,
            disabledUsers:
                data.users?.user?.disabled + data.users?.alumni?.disabled || 0,

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

        return processedMetrics;
    };

    // Convert date range to match API format
    const formatDateRangeForAPI = (dateRange) => {
        if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
            const fallback = {
                from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
                to: dayjs().format("YYYY-MM-DD"),
            };
            return fallback;
        }

        const startDate = dateRange[0];
        const endDate = dateRange[1];

        const apiFormat = {
            from: startDate.format("YYYY-MM-DD"),
            to: endDate.format("YYYY-MM-DD"),
        };

        return apiFormat;
    };

    // Process job applications chart data
    const processJobApplicationsData = (jobAppResponse) => {
        if (
            !jobAppResponse ||
            !jobAppResponse.data ||
            !Array.isArray(jobAppResponse.data)
        ) {
            console.warn("Invalid job applications data structure");
            return [];
        }

        return jobAppResponse.data.map((item) => ({
            date: item.date || "",
            applications: item.total || 0,
        }));
    };

    // Main data fetching function
    const fetchDashboardData = async () => {
        try {
            setRefreshing(true);

            // Fetch metrics data (no time range needed)
            const metricsResponse = await api.getDashboardMetrics();

            // Process metrics data
            const processedMetrics = processMetricsData(metricsResponse);

            // Fetch chart data in parallel
            const [userGrowthResponse, jobApplicationsResponse] =
                await Promise.all([
                    api
                        .getDashboardChart(
                            formatDateRangeForAPI(chartDateRanges.userGrowth)
                        )
                        .catch((err) => {
                            console.warn(
                                "User growth chart data fetch failed:",
                                err
                            );
                            return { data: [] };
                        }),
                    api
                        .getJobApplicationChart(
                            formatDateRangeForAPI(
                                chartDateRanges.jobApplications
                            )
                        )
                        .catch((err) => {
                            console.warn(
                                "Job applications chart data fetch failed:",
                                err
                            );
                            return { data: [] };
                        }),
                ]);

            // Process chart data
            const processedJobApplicationsData = processJobApplicationsData(
                jobApplicationsResponse
            );

            // Combine all data
            const combinedData = {
                ...processedMetrics,
                userGrowthData:
                    userGrowthResponse.data ||
                    userGrowthResponse.userGrowthData ||
                    [],
                jobApplicationsData: processedJobApplicationsData,
            };

            setDashboardData(combinedData);

            message.success("Dashboard data loaded successfully");
        } catch (error) {
            // Show specific error message
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Unknown error";
            message.error(`Failed to load dashboard data: ${errorMessage}`);
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
            } else if (chartType === "jobApplications") {
                const jobAppData = await api.getJobApplicationChart(
                    dateRangeForAPI
                );
                const processedJobAppData =
                    processJobApplicationsData(jobAppData);
                updatedData = { jobApplicationsData: processedJobAppData };
            }

            setDashboardData((prevData) => ({
                ...prevData,
                ...updatedData,
            }));

            message.success(`${chartType} chart updated successfully`);
        } catch (error) {
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

            setChartDateRanges((prev) => ({
                ...prev,
                [chartType]: validatedRange,
            }));

            updateChartData(chartType, validatedRange);
        } catch (error) {
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
            message.error("Failed to download CSV");
        }
    };

    const downloadUserGrowthCSV = () => {
        const csvData = dashboardData.userGrowthData.map((item) => ({
            Date: item.date || "",
            "Active Users": item.activeUsers || 0,
        }));
        downloadCSV(csvData, "User_Growth_Trend");
    };

    const downloadJobApplicationsCSV = () => {
        const csvData = dashboardData.jobApplicationsData.map((item) => ({
            Date: item.date || "",
            Applications: item.applications || 0,
        }));
        downloadCSV(csvData, "Job_Applications_Trend");
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

            {/* Dashboard Statistics */}
            <div style={{ marginBottom: "32px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 20,
                    }}
                >
                    {/* Active Users */}
                    <Card
                        style={{
                            borderRadius: 16,
                            border: "2px solid #e8f4fd",
                            background:
                                "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
                        }}
                    >
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    backgroundColor: "#e8f4fd",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    fontSize: "24px",
                                    color: "#2c5aa0",
                                }}
                            >
                                <UserOutlined />
                            </div>
                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 700,
                                    color: "#2c5aa0",
                                    marginBottom: "8px",
                                }}
                            >
                                {(
                                    dashboardData.activeUsers +
                                    dashboardData.activeAlumni
                                ).toLocaleString()}
                            </div>
                            <div
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#262626",
                                    marginBottom: "12px",
                                }}
                            >
                                Active Users
                            </div>
                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "#333",
                                    lineHeight: 1.5,
                                    fontWeight: 500,
                                }}
                            >
                                <div>Alumni: {dashboardData.activeAlumni}</div>
                                <div>
                                    Free Users: {dashboardData.activeUsers}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Inactive Users */}
                    <Card
                        style={{
                            borderRadius: 16,
                            border: "2px solid #fdeaea",
                            background:
                                "linear-gradient(135deg, #fff8f8 0%, #ffffff 100%)",
                        }}
                    >
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fdeaea",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    fontSize: "24px",
                                    color: "#dc3545",
                                }}
                            >
                                <UserOutlined />
                            </div>
                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 700,
                                    color: "#dc3545",
                                    marginBottom: "8px",
                                }}
                            >
                                {(
                                    dashboardData.unauthorisedFreeUsers +
                                    dashboardData.unauthorisedAlumniUsers +
                                    dashboardData.disabledUsers
                                ).toLocaleString()}
                            </div>
                            <div
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#262626",
                                    marginBottom: "12px",
                                }}
                            >
                                Inactive Users
                            </div>
                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "#333",
                                    lineHeight: 1.5,
                                    fontWeight: 500,
                                }}
                            >
                                <div>
                                    Free Users:{" "}
                                    {dashboardData.disabledUsers +
                                        dashboardData.unauthorisedFreeUsers}
                                </div>
                                <div>
                                    Alumni:{" "}
                                    {dashboardData.unauthorisedAlumniUsers}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Jobs */}
                    <Card
                        style={{
                            borderRadius: 16,
                            border: "2px solid #e8f5e8",
                            background:
                                "linear-gradient(135deg, #f8fff8 0%, #ffffff 100%)",
                        }}
                    >
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    backgroundColor: "#e8f5e8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    fontSize: "24px",
                                    color: "#155724",
                                }}
                            >
                                <InboxOutlined />
                            </div>
                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 700,
                                    color: "#155724",
                                    marginBottom: "8px",
                                }}
                            >
                                {dashboardData.totalJobs.toLocaleString()}
                            </div>
                            <div
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#262626",
                                    marginBottom: "12px",
                                }}
                            >
                                Jobs
                            </div>
                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "#333",
                                    lineHeight: 1.5,
                                    fontWeight: 500,
                                }}
                            >
                                <div>Active: {dashboardData.activeJobs}</div>
                                <div>
                                    Inactive: {dashboardData.inactiveJobs}
                                </div>
                                <div
                                    style={{
                                        marginTop: "6px",
                                        fontWeight: 600,
                                        color: "#155724",
                                        fontSize: "15px",
                                    }}
                                >
                                    Job Applications:{" "}
                                    {dashboardData.jobApplications}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Content */}
                    <Card
                        style={{
                            borderRadius: 16,
                            border: "2px solid #f3e8ff",
                            background:
                                "linear-gradient(135deg, #faf8ff 0%, #ffffff 100%)",
                        }}
                    >
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    backgroundColor: "#f3e8ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    fontSize: "24px",
                                    color: "#6f42c1",
                                }}
                            >
                                <VideoCameraOutlined />
                            </div>
                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 700,
                                    color: "#6f42c1",
                                    marginBottom: "8px",
                                }}
                            >
                                {(
                                    dashboardData.activeWebinars +
                                    dashboardData.activeCourses
                                ).toLocaleString()}
                            </div>
                            <div
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#262626",
                                    marginBottom: "12px",
                                }}
                            >
                                Content
                            </div>
                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "#333",
                                    lineHeight: 1.5,
                                    fontWeight: 500,
                                }}
                            >
                                <div>
                                    Webinars: {dashboardData.activeWebinars}
                                </div>
                                <div>
                                    Courses: {dashboardData.activeCourses}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Divider />

            {/* Charts Section */}
            <Row gutter={[16, 16]}>
                {/* User Growth Line Chart */}
                <Col xs={24}>
                    <Card style={{ padding: "24px", marginBottom: "16px" }}>
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

                {/* Job Applications Trend Chart */}
                <Col xs={24}>
                    <Card style={{ padding: "24px" }}>
                        <ChartHeader
                            title="Job Applications Trend"
                            chartType="jobApplications"
                            onDateRangeChange={handleChartDateRangeChange}
                            onDownloadCSV={downloadJobApplicationsCSV}
                            dateRange={chartDateRanges.jobApplications}
                            loading={chartLoading.jobApplications}
                        />
                        <ChartWrapper loading={chartLoading.jobApplications}>
                            <div ref={jobApplicationsChartRef}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={dashboardData.jobApplicationsData}
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
                                            dataKey="applications"
                                            stroke="#fa8c16"
                                            strokeWidth={2}
                                            dot={{ fill: "#fa8c16", r: 4 }}
                                            activeDot={{ r: 6 }}
                                            name="Applications"
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
