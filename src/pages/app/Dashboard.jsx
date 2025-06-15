// src/pages/app/Dashboard.jsx
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
import moment from "moment";
import Papa from "papaparse";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Color palette for charts - Updated with brand colors
const COLORS = [
    "#04248c",
    "#52c41a",
    "#fa8c16",
    "#1890ff",
    "#722ed1",
    "#13c2c2",
];

// Date range presets
const getDatePresets = () => {
    const today = moment().startOf("day"); // Ensure we start from beginning of today
    return {
        "Last 7 Days": [
            moment().subtract(6, "days").startOf("day"),
            today.clone(),
        ],
        "This Month": [moment().startOf("month"), today.clone()],
        "Last Month": [
            moment().subtract(1, "month").startOf("month"),
            moment().subtract(1, "month").endOf("month"),
        ],
    };
};

const Dashboard = () => {
    const { api, isLoading } = useAPI();
    const [dashboardData, setDashboardData] = useState({
        // Current overall statistics (from /dashboard/metrics - no time range)
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalJobs: 0,
        activeJobs: 0,
        inactiveJobs: 0,
        jobApplications: 0,
        monthlyRegistrations: 0,
        registrationTrend: 0,

        // Chart data (time-based from individual chart APIs)
        userGrowthData: [],
        jobCategoryData: [],
        userStatusData: [],
    });
    const [refreshing, setRefreshing] = useState(false);

    // Individual chart loading states
    const [chartLoading, setChartLoading] = useState({
        userGrowth: false,
        jobCategory: false,
        userStatus: false,
    });

    // Individual chart date ranges - each chart can have its own date range
    const [chartDateRanges, setChartDateRanges] = useState(() => {
        const today = moment().startOf("day");
        const defaultRange = [
            moment().subtract(6, "days").startOf("day"),
            today.clone(),
        ];
        return {
            userGrowth: defaultRange,
            jobCategory: [...defaultRange], // Create new array reference
            userStatus: [...defaultRange], // Create new array reference
        };
    });

    // Chart refs for downloading
    const userGrowthChartRef = useRef(null);
    const jobCategoryChartRef = useRef(null);
    const userStatusChartRef = useRef(null);

    const processJobCategoryData = (jobStatsResponse) => {
        if (
            !jobStatsResponse ||
            !jobStatsResponse.data ||
            !Array.isArray(jobStatsResponse.data)
        ) {
            return [];
        }

        return jobStatsResponse.data.map((categoryData) => {
            const category = categoryData.category || "Unknown";
            let active = 0;
            let inactive = 0;

            // Process stats array to count active/inactive jobs
            if (categoryData.stats && Array.isArray(categoryData.stats)) {
                categoryData.stats.forEach((stat) => {
                    if (stat.status === 1) {
                        active = stat.count || 0;
                    } else if (stat.status === -1 || stat.status === 0) {
                        inactive += stat.count || 0;
                    }
                });
            }

            return {
                category,
                active,
                inactive,
                total: categoryData.totalJobs || 0,
            };
        });
    };

    // Process the new metrics data format
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

        // If the response has the expected structure
        if (metricsResponse && metricsResponse.data) {
            const data = metricsResponse.data;

            return {
                ...defaultMetrics,
                // Users data
                totalUsers: data.users?.total || 0,
                activeUsers: data.users?.Active || 0,
                inactiveUsers: data.users?.Unauthorized || 0,

                // Jobs data
                totalJobs: data.jobs?.total || 0,
                activeJobs: data.jobs?.Active || 0,
                inactiveJobs:
                    (data.jobs?.total || 0) - (data.jobs?.Active || 0),

                // Applications data
                jobApplications: data.applicationStats || 0,

                // Use active users as proxy for monthly registrations
                monthlyRegistrations: data.users?.Active || 0,
            };
        }

        // Fallback if data structure is different or missing
        return defaultMetrics;
    };

    // Process user status data for pie chart from the new API format
    const processUserStatusData = (userStatsResponse) => {
        if (
            !userStatsResponse ||
            !userStatsResponse.data ||
            !Array.isArray(userStatsResponse.data)
        ) {
            return [];
        }

        return userStatsResponse.data.map((statusData) => ({
            name: statusData.label || "Unknown",
            value: statusData.count || 0,
        }));
    };

    // Convert date range to API format
    const formatDateRangeForAPI = (dateRange) => {
        if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
            // Fallback to last 7 days
            const today = moment();
            const weekAgo = moment().subtract(6, "days");
            return {
                from: weekAgo.format("DD/MM/YYYY"),
                to: today.format("DD/MM/YYYY"),
            };
        }

        const [startDate, endDate] = dateRange;

        // Ensure we have valid moment objects
        const start = moment.isMoment(startDate)
            ? startDate
            : moment(startDate);
        const end = moment.isMoment(endDate) ? endDate : moment(endDate);

        return {
            from: start.format("DD/MM/YYYY"),
            to: end.format("DD/MM/YYYY"),
        };
    };

    const fetchDashboardData = async () => {
        try {
            setRefreshing(true);

            // Fetch all data in parallel with respective date ranges
            const [
                metricsResponse,
                chartResponse,
                jobCategoryResponse,
                userStatusResponse,
            ] = await Promise.all([
                api.getDashboardMetrics(), // No time range - gets current overall statistics
                api.getDashboardChart(
                    formatDateRangeForAPI(chartDateRanges.userGrowth)
                ),
                api.getJobCategoryStats
                    ? api.getJobCategoryStats(
                          formatDateRangeForAPI(chartDateRanges.jobCategory)
                      )
                    : api.getMockJobCategoryStats
                    ? api.getMockJobCategoryStats(
                          formatDateRangeForAPI(chartDateRanges.jobCategory)
                      )
                    : Promise.resolve({ data: [] }),
                api.getUserStatusStats
                    ? api.getUserStatusStats(
                          formatDateRangeForAPI(chartDateRanges.userStatus)
                      )
                    : api.getMockUserStatusStats
                    ? api.getMockUserStatusStats(
                          formatDateRangeForAPI(chartDateRanges.userStatus)
                      )
                    : Promise.resolve({ data: [] }),
            ]);

            // Process all the responses
            const processedMetrics = processMetricsData(metricsResponse);
            const processedJobCategories =
                processJobCategoryData(jobCategoryResponse);
            const processedUserStatusData =
                processUserStatusData(userStatusResponse);

            // Combine API responses into dashboard data structure
            const combinedData = {
                // Processed metrics data
                ...processedMetrics,

                // Chart data
                userGrowthData:
                    chartResponse.data || chartResponse.userGrowthData || [],
                jobCategoryData: processedJobCategories || [],
                userStatusData: processedUserStatusData || [],
            };

            setDashboardData(combinedData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            message.error("Failed to load dashboard data");
        } finally {
            setRefreshing(false);
        }
    };

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

            console.log(
                `Updating ${chartType} chart data for date range:`,
                newDateRange.map((d) =>
                    moment.isMoment(d)
                        ? d.format("DD/MM/YYYY")
                        : moment(d).format("DD/MM/YYYY")
                )
            );

            // Set loading state for ONLY the specific chart
            setChartLoading((prev) => ({
                userGrowth: chartType === "userGrowth" ? true : prev.userGrowth,
                jobCategory:
                    chartType === "jobCategory" ? true : prev.jobCategory,
                userStatus: chartType === "userStatus" ? true : prev.userStatus,
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
                let jobCategoryResponse;
                if (api.getJobCategoryStats) {
                    jobCategoryResponse = await api.getJobCategoryStats(
                        dateRangeForAPI
                    );
                } else if (api.getMockJobCategoryStats) {
                    jobCategoryResponse = await api.getMockJobCategoryStats(
                        dateRangeForAPI
                    );
                } else {
                    jobCategoryResponse = { data: [] };
                }

                const processedJobCategories =
                    processJobCategoryData(jobCategoryResponse);
                updatedData = {
                    jobCategoryData: processedJobCategories,
                };
            } else if (chartType === "userStatus") {
                let userStatusResponse;
                if (api.getUserStatusStats) {
                    userStatusResponse = await api.getUserStatusStats(
                        dateRangeForAPI
                    );
                } else if (api.getMockUserStatusStats) {
                    userStatusResponse = await api.getMockUserStatusStats(
                        dateRangeForAPI
                    );
                } else {
                    userStatusResponse = { data: [] };
                }

                const processedUserStatusData =
                    processUserStatusData(userStatusResponse);
                updatedData = {
                    userStatusData: processedUserStatusData,
                };
            }

            console.log(`${chartType} updated data:`, updatedData);
            setDashboardData((prevData) => ({
                ...prevData,
                ...updatedData,
            }));

            message.success(`${chartType} chart updated successfully`);
        } catch (error) {
            console.error(`Error updating ${chartType} chart data:`, error);
            message.error(`Failed to update ${chartType} chart`);
        } finally {
            // Clear loading state for ONLY the specific chart
            setChartLoading((prev) => ({
                userGrowth:
                    chartType === "userGrowth" ? false : prev.userGrowth,
                jobCategory:
                    chartType === "jobCategory" ? false : prev.jobCategory,
                userStatus:
                    chartType === "userStatus" ? false : prev.userStatus,
            }));
        }
    };

    // Handle chart date range change
    const handleChartDateRangeChange = (chartType, newDateRange) => {
        setChartDateRanges((prev) => ({
            ...prev,
            [chartType]: newDateRange,
        }));
        updateChartData(chartType, newDateRange);
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
                    `${filename}_${moment().format("DD/MM/YYYY")}.csv`
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

    // Custom DateRangePicker with presets
    const DateRangePickerWithPresets = ({
        value,
        onChange,
        loading,
        chartType,
    }) => {
        const [dropdownVisible, setDropdownVisible] = useState(false);
        const presets = getDatePresets();

        const handlePresetClick = (presetRange) => {
            if (Array.isArray(presetRange) && presetRange.length === 2) {
                // Clone the moments to avoid mutation
                const clonedRange = [
                    presetRange[0].clone(),
                    presetRange[1].clone(),
                ];
                onChange(chartType, clonedRange);
                setDropdownVisible(false);
            }
        };

        const handleCustomRangeChange = (dates) => {
            if (dates && Array.isArray(dates) && dates.length === 2) {
                onChange(chartType, dates);
                setDropdownVisible(false);
            }
        };

        const formatDisplayText = () => {
            if (value && Array.isArray(value) && value.length === 2) {
                const [start, end] = value;
                const startMoment = moment.isMoment(start)
                    ? start
                    : moment(start);
                const endMoment = moment.isMoment(end) ? end : moment(end);

                // Check if it matches any preset (use current presets, not stale ones)
                const currentPresets = getDatePresets();
                const matchingPreset = Object.entries(currentPresets).find(
                    ([_, range]) => {
                        return (
                            startMoment.isSame(range[0], "day") &&
                            endMoment.isSame(range[1], "day")
                        );
                    }
                );

                if (matchingPreset) {
                    return matchingPreset[0];
                }

                return `${startMoment.format("MMM DD")} - ${endMoment.format(
                    "MMM DD"
                )}`;
            }
            return "Last 7 Days";
        };

        const dropdownContent = (
            <div
                style={{
                    padding: "12px",
                    minWidth: "320px",
                    backgroundColor: "white",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Preset buttons */}
                <div style={{ marginBottom: "16px" }}>
                    <div
                        style={{
                            fontWeight: 600,
                            marginBottom: "8px",
                            color: "#262626",
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
                        {Object.entries(getDatePresets()).map(
                            ([label, range]) => {
                                const isSelected =
                                    value &&
                                    Array.isArray(value) &&
                                    value.length === 2 &&
                                    moment(value[0]).isSame(range[0], "day") &&
                                    moment(value[1]).isSame(range[1], "day");

                                return (
                                    <Button
                                        key={label}
                                        type={isSelected ? "primary" : "text"}
                                        block
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePresetClick(range);
                                        }}
                                        style={{
                                            textAlign: "left",
                                            height: "32px",
                                            justifyContent: "flex-start",
                                        }}
                                    >
                                        {label}
                                    </Button>
                                );
                            }
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div
                    style={{
                        borderTop: "1px solid #f0f0f0",
                        margin: "16px 0 12px 0",
                        paddingTop: "12px",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 600,
                            marginBottom: "8px",
                            color: "#262626",
                            fontSize: "14px",
                        }}
                    >
                        Custom Range
                    </div>
                    <RangePicker
                        value={value}
                        onChange={(dates, dateStrings) => {
                            if (
                                dates &&
                                Array.isArray(dates) &&
                                dates.length === 2
                            ) {
                                // Ensure end date is not in the future
                                const endDate = dates[1];
                                const today = moment().startOf("day");
                                if (endDate.isAfter(today)) {
                                    message.warning(
                                        "End date cannot be in the future"
                                    );
                                    return;
                                }
                                handleCustomRangeChange(dates);
                            }
                        }}
                        format="DD/MM/YYYY"
                        disabled={loading}
                        style={{ width: "100%" }}
                        placeholder={["Start Date", "End Date"]}
                        allowClear={false}
                        size="middle"
                        disabledDate={(current) => {
                            // Disable future dates more strictly
                            return current && current < moment().endOf("day");
                        }}
                        showTime={false}
                        // defaultPickerValue={[
                        //     moment().subtract(7, "days"),
                        //     moment(),
                        // ]}
                    />
                </div>
            </div>
        );

        return (
            <Dropdown
                dropdownRender={() => dropdownContent}
                trigger={["click"]}
                open={dropdownVisible}
                onOpenChange={(visible) => {
                    if (!loading) {
                        setDropdownVisible(visible);
                    }
                }}
                disabled={loading}
                placement="bottomLeft"
                overlayStyle={{ zIndex: 1050 }}
            >
                <Button
                    icon={<CalendarOutlined />}
                    disabled={loading}
                    style={{ minWidth: "180px" }}
                >
                    {formatDisplayText()}
                    <DownOutlined />
                </Button>
            </Dropdown>
        );
    };

    // Chart header component with controls
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
                        {stat.trend && (
                            <div style={{ marginTop: 8 }}>
                                <Space>
                                    {stat.trend === "up" ? (
                                        <RiseOutlined
                                            style={{ color: "#52c41a" }}
                                        />
                                    ) : (
                                        <FallOutlined
                                            style={{ color: "#e31c24" }}
                                        />
                                    )}
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                    >
                                        {stat.trendValue}% from last month
                                    </Text>
                                </Space>
                            </div>
                        )}
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
