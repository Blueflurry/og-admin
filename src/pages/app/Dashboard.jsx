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
    Select,
    Divider,
    Button,
} from "antd";
import {
    UserOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InboxOutlined,
    FileTextOutlined,
    CalendarOutlined,
    RiseOutlined,
    FallOutlined,
    ReloadOutlined,
    DownloadOutlined,
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
import html2canvas from "html2canvas"; // You'll need to install this: npm install html2canvas

const { Title, Text } = Typography;
const { Option } = Select;

// Color palette for charts - Updated with brand colors
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
        userGrowthData: [],
        jobCategoryData: [],
        userStatusData: [],
        recentActivities: [],
        registrationTrend: 0,
    });
    const [timeRange, setTimeRange] = useState("7days");
    const [refreshing, setRefreshing] = useState(false);

    // Individual chart date ranges
    const [chartTimeRanges, setChartTimeRanges] = useState({
        userGrowth: "7days",
        jobCategory: "7days",
        userStatus: "7days",
    });

    // Chart refs for downloading
    const userGrowthChartRef = useRef(null);
    const jobCategoryChartRef = useRef(null);
    const userStatusChartRef = useRef(null);

    const fetchDashboardData = async () => {
        try {
            setRefreshing(true);

            // Fetch both metrics and chart data from APIs using API class methods
            const [metricsData, chartData] = await Promise.all([
                api.getDashboardMetrics(timeRange),
                api.getDashboardChart(timeRange),
            ]);

            // Combine API responses into dashboard data structure
            const combinedData = {
                // Metrics data (adjust field names based on your API response)
                totalUsers: metricsData.totalUsers || 0,
                activeUsers: metricsData.activeUsers || 0,
                inactiveUsers: metricsData.inactiveUsers || 0,
                totalJobs: metricsData.totalJobs || 0,
                activeJobs: metricsData.activeJobs || 0,
                inactiveJobs: metricsData.inactiveJobs || 0,
                jobApplications: metricsData.jobApplications || 0,
                monthlyRegistrations: metricsData.monthlyRegistrations || 0,
                registrationTrend: metricsData.registrationTrend || 0,

                // Chart data (adjust field names based on your API response)
                userGrowthData: chartData.data || [],
                jobCategoryData: chartData.jobCategoryData || [],
                userStatusData: chartData.userStatusData || [],
                recentActivities: chartData.recentActivities || [],
            };

            setDashboardData(combinedData);

            console.log("Dashboard data loaded:", combinedData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            message.error("Failed to load dashboard data");
        } finally {
            setRefreshing(false);
        }
    };

    // Function to update individual chart data
    const updateChartData = async (chartType, newTimeRange) => {
        try {
            // Fetch fresh chart data with new time range using API class method
            const chartData = await api.getDashboardChart(newTimeRange);

            setDashboardData((prevData) => ({
                ...prevData,
                ...(chartType === "userGrowth" && {
                    userGrowthData: chartData.userGrowthData || [],
                }),
                ...(chartType === "jobCategory" && {
                    jobCategoryData: chartData.jobCategoryData || [],
                }),
                ...(chartType === "userStatus" && {
                    userStatusData: chartData.userStatusData || [],
                }),
            }));

            console.log(
                `${chartType} chart data updated for ${newTimeRange}:`,
                chartData
            );
        } catch (error) {
            console.error(`Error updating ${chartType} chart data:`, error);
            message.error(`Failed to update ${chartType} chart`);
        }
    };

    // Handle chart time range change
    const handleChartTimeRangeChange = (chartType, newTimeRange) => {
        setChartTimeRanges((prev) => ({
            ...prev,
            [chartType]: newTimeRange,
        }));
        updateChartData(chartType, newTimeRange);
    };

    // Download chart as image
    const downloadChart = async (chartRef, chartName) => {
        try {
            if (chartRef.current) {
                const canvas = await html2canvas(chartRef.current, {
                    backgroundColor: "#ffffff",
                    scale: 2, // Higher quality
                    useCORS: true,
                });

                const link = document.createElement("a");
                link.download = `${chartName}_${
                    new Date().toISOString().split("T")[0]
                }.png`;
                link.href = canvas.toDataURL();
                link.click();

                message.success(`${chartName} chart downloaded successfully!`);
            }
        } catch (error) {
            console.error("Error downloading chart:", error);
            message.error("Failed to download chart");
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

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

    // Chart header component with controls
    const ChartHeader = ({
        title,
        chartType,
        onTimeRangeChange,
        onDownload,
        timeRange,
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
            </Title>
            <Space>
                <Select
                    value={timeRange}
                    onChange={(value) => onTimeRangeChange(chartType, value)}
                    style={{ width: 120 }}
                    size="small"
                >
                    <Option value="7days">7 days</Option>
                    <Option value="30days">30 days</Option>
                    <Option value="90days">90 days</Option>
                </Select>
                <Button
                    icon={<DownloadOutlined />}
                    onClick={onDownload}
                    size="small"
                    type="text"
                    title="Download chart"
                />
            </Space>
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
            suffix: `active / ${dashboardData.inactiveUsers} inactive`,
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
                        <Select
                            value={timeRange}
                            onChange={setTimeRange}
                            style={{ width: 140 }}
                        >
                            <Option value="7days">Last 7 days</Option>
                            <Option value="30days">Last 30 days</Option>
                            <Option value="90days">Last 90 days</Option>
                        </Select>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchDashboardData}
                            loading={refreshing}
                            type="primary"
                        >
                            Refresh
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
                            onTimeRangeChange={handleChartTimeRangeChange}
                            onDownload={() =>
                                downloadChart(
                                    userGrowthChartRef,
                                    "User_Growth_Trend"
                                )
                            }
                            timeRange={chartTimeRanges.userGrowth}
                        />
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
                                    <XAxis dataKey="date" stroke="#8c8c8c" />
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
                    </Card>
                </Col>

                {/* Job Categories Bar Chart */}
                <Col xs={24} lg={12}>
                    <Card style={{ padding: "24px" }}>
                        <ChartHeader
                            title="Jobs by Category"
                            chartType="jobCategory"
                            onTimeRangeChange={handleChartTimeRangeChange}
                            onDownload={() =>
                                downloadChart(
                                    jobCategoryChartRef,
                                    "Jobs_by_Category"
                                )
                            }
                            timeRange={chartTimeRanges.jobCategory}
                        />
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
                    </Card>
                </Col>

                {/* User Status Pie Chart */}
                <Col xs={24} lg={12}>
                    <Card style={{ padding: "24px" }}>
                        <ChartHeader
                            title="User Status Distribution"
                            chartType="userStatus"
                            onTimeRangeChange={handleChartTimeRangeChange}
                            onDownload={() =>
                                downloadChart(
                                    userStatusChartRef,
                                    "User_Status_Distribution"
                                )
                            }
                            timeRange={chartTimeRanges.userStatus}
                        />
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
                                                (outerRadius - innerRadius) *
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
                                                        x > cx ? "start" : "end"
                                                    }
                                                    dominantBaseline="central"
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    {`${(percent * 100).toFixed(
                                                        0
                                                    )}%`}
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
                                                        index === 0
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
                    </Card>
                </Col>
            </Row>

            {/* Loading Overlay */}
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
