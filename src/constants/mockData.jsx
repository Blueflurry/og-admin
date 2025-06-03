const USERDATA = [
    {
        key: "1",
        name: "John Brown",
        age: 32,
        address: "New York No. 1 Lake Park",
    },
    {
        key: "2",
        name: "Jim Green",
        age: 42,
        address: "London No. 1 Lake Park",
    },
    {
        key: "3",
        name: "Joe Black",
        age: 32,
        address: "Sydney No. 1 Lake Park",
    },
    {
        key: "4",
        name: "Jim Red",
        age: 32,
        address: "London No. 2 Lake Park",
    },
];

export default USERDATA;

// mockData.js - Mock data for Job Applications and Carousels modules

// ==========================================
// JOB APPLICATIONS MOCK DATA
// ==========================================

// export const JOB_APPLICATIONS_MOCK_DATA = [
//     {
//         id: "app_001",
//         _id: "674a1b2c3d4e5f6789012345",
//         applicant: {
//             name: {
//                 first: "Priya",
//                 middle: "Kumar",
//                 last: "Singh",
//             },
//             email: "priya.singh@email.com",
//             phone: "9876543210",
//             address: {
//                 street: "123, MG Road, Sector 14",
//                 city: "Gurugram",
//                 state: "Haryana",
//                 pincode: "122001",
//                 country: "India",
//             },
//             imageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
//             dateOfBirth: "1995-08-15T00:00:00.000Z",
//         },
//         job: {
//             id: "job_001",
//             title: "Senior React Developer",
//             company: {
//                 id: "comp_001",
//                 name: "TechCorp Solutions Pvt Ltd",
//                 imageUrl: "https://logo.clearbit.com/techcorp.com",
//             },
//             location: {
//                 city: "Gurugram",
//                 state: "Haryana",
//                 isRemote: false,
//             },
//             salaryRange: "₹12-18 LPA",
//         },
//         applicationStatus: "under_review",
//         experienceYears: 4,
//         currentSalary: 800000,
//         expectedSalary: 1400000,
//         noticePeriod: 30,
//         skills: ["React", "JavaScript", "Node.js", "MongoDB", "AWS"],
//         education: {
//             degree: "B.Tech",
//             field: "Computer Science Engineering",
//             university: "Delhi Technological University",
//             graduationYear: 2017,
//         },
//         resumeUrl: "https://example.com/resumes/priya_singh_resume.pdf",
//         coverLetter:
//             "I am excited to apply for the Senior React Developer position. With 4 years of experience in full-stack development...",
//         appliedDate: "2024-12-15T10:30:00.000Z",
//         lastUpdated: "2024-12-18T14:45:00.000Z",
//         interviewScheduled: null,
//         notes: "Strong technical background, good communication skills",
//         source: "company_website",
//         createdAt: "2024-12-15T10:30:00.000Z",
//         updatedAt: "2024-12-18T14:45:00.000Z",
//     },
//     {
//         id: "app_002",
//         _id: "674a1b2c3d4e5f6789012346",
//         applicant: {
//             name: {
//                 first: "Rahul",
//                 middle: "",
//                 last: "Sharma",
//             },
//             email: "rahul.sharma.dev@gmail.com",
//             phone: "9123456789",
//             address: {
//                 street: "45, Cyber City, DLF Phase 2",
//                 city: "Gurugram",
//                 state: "Haryana",
//                 pincode: "122002",
//                 country: "India",
//             },
//             imageUrl: "https://randomuser.me/api/portraits/men/2.jpg",
//             dateOfBirth: "1992-03-22T00:00:00.000Z",
//         },
//         job: {
//             id: "job_002",
//             title: "Full Stack Java Developer",
//             company: {
//                 id: "comp_002",
//                 name: "InnovateTech India",
//                 imageUrl: "https://logo.clearbit.com/innovatetech.in",
//             },
//             location: {
//                 city: "Noida",
//                 state: "Uttar Pradesh",
//                 isRemote: true,
//             },
//             salaryRange: "₹15-22 LPA",
//         },
//         applicationStatus: "interview_scheduled",
//         experienceYears: 6,
//         currentSalary: 1200000,
//         expectedSalary: 1800000,
//         noticePeriod: 60,
//         skills: [
//             "Java",
//             "Spring Boot",
//             "MySQL",
//             "Docker",
//             "Kubernetes",
//             "React",
//         ],
//         education: {
//             degree: "M.Tech",
//             field: "Software Engineering",
//             university: "IIT Delhi",
//             graduationYear: 2016,
//         },
//         resumeUrl: "https://example.com/resumes/rahul_sharma_resume.pdf",
//         coverLetter:
//             "As a passionate full-stack developer with 6 years of experience in Java ecosystem...",
//         appliedDate: "2024-12-10T09:15:00.000Z",
//         lastUpdated: "2024-12-20T11:30:00.000Z",
//         interviewScheduled: {
//             date: "2024-12-22T15:00:00.000Z",
//             type: "technical",
//             interviewer: "John Smith",
//             meetingLink: "https://meet.google.com/abc-def-ghi",
//         },
//         notes: "Excellent Java skills, previous experience with microservices",
//         source: "linkedin",
//         createdAt: "2024-12-10T09:15:00.000Z",
//         updatedAt: "2024-12-20T11:30:00.000Z",
//     },
//     {
//         id: "app_003",
//         _id: "674a1b2c3d4e5f6789012347",
//         applicant: {
//             name: {
//                 first: "Sneha",
//                 middle: "Raj",
//                 last: "Patel",
//             },
//             email: "sneha.patel@techmail.com",
//             phone: "9988776655",
//             address: {
//                 street: "78, IT Park, Electronic City",
//                 city: "Bangalore",
//                 state: "Karnataka",
//                 pincode: "560100",
//                 country: "India",
//             },
//             imageUrl: "https://randomuser.me/api/portraits/women/3.jpg",
//             dateOfBirth: "1994-11-08T00:00:00.000Z",
//         },
//         job: {
//             id: "job_003",
//             title: "DevOps Engineer",
//             company: {
//                 id: "comp_003",
//                 name: "CloudFirst Technologies",
//                 imageUrl: "https://logo.clearbit.com/cloudfirst.com",
//             },
//             location: {
//                 city: "Bangalore",
//                 state: "Karnataka",
//                 isRemote: false,
//             },
//             salaryRange: "₹18-25 LPA",
//         },
//         applicationStatus: "hired",
//         experienceYears: 5,
//         currentSalary: 1400000,
//         expectedSalary: 2000000,
//         noticePeriod: 45,
//         skills: [
//             "AWS",
//             "Docker",
//             "Kubernetes",
//             "Jenkins",
//             "Terraform",
//             "Python",
//         ],
//         education: {
//             degree: "B.E.",
//             field: "Electronics and Communication",
//             university: "Bangalore Institute of Technology",
//             graduationYear: 2016,
//         },
//         resumeUrl: "https://example.com/resumes/sneha_patel_resume.pdf",
//         coverLetter:
//             "I am writing to express my interest in the DevOps Engineer position. My experience with cloud infrastructure...",
//         appliedDate: "2024-11-28T14:20:00.000Z",
//         lastUpdated: "2024-12-19T16:00:00.000Z",
//         interviewScheduled: null,
//         notes: "Excellent DevOps experience, strong AWS knowledge, hired!",
//         source: "job_portal",
//         offerDetails: {
//             salary: 1950000,
//             joiningDate: "2025-01-15T00:00:00.000Z",
//             designation: "Senior DevOps Engineer",
//         },
//         createdAt: "2024-11-28T14:20:00.000Z",
//         updatedAt: "2024-12-19T16:00:00.000Z",
//     },
//     {
//         id: "app_004",
//         _id: "674a1b2c3d4e5f6789012348",
//         applicant: {
//             name: {
//                 first: "Amit",
//                 middle: "Kumar",
//                 last: "Gupta",
//             },
//             email: "amit.gupta.designer@outlook.com",
//             phone: "9567891234",
//             address: {
//                 street: "156, Indiranagar, 12th Main Road",
//                 city: "Bangalore",
//                 state: "Karnataka",
//                 pincode: "560038",
//                 country: "India",
//             },
//             imageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
//             dateOfBirth: "1996-07-12T00:00:00.000Z",
//         },
//         job: {
//             id: "job_004",
//             title: "UI/UX Designer",
//             company: {
//                 id: "comp_004",
//                 name: "DesignHub Studio",
//                 imageUrl: "https://logo.clearbit.com/designhub.co",
//             },
//             location: {
//                 city: "Mumbai",
//                 state: "Maharashtra",
//                 isRemote: true,
//             },
//             salaryRange: "₹8-12 LPA",
//         },
//         applicationStatus: "rejected",
//         experienceYears: 2,
//         currentSalary: 600000,
//         expectedSalary: 1000000,
//         noticePeriod: 30,
//         skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
//         education: {
//             degree: "B.Des",
//             field: "Communication Design",
//             university: "National Institute of Design",
//             graduationYear: 2019,
//         },
//         resumeUrl: "https://example.com/resumes/amit_gupta_resume.pdf",
//         coverLetter:
//             "I am passionate about creating user-centered designs and would love to contribute to your team...",
//         appliedDate: "2024-12-05T11:45:00.000Z",
//         lastUpdated: "2024-12-16T09:30:00.000Z",
//         interviewScheduled: null,
//         notes: "Good portfolio but looking for someone with more experience",
//         source: "referral",
//         rejectionReason: "Experience level doesn't match requirements",
//         createdAt: "2024-12-05T11:45:00.000Z",
//         updatedAt: "2024-12-16T09:30:00.000Z",
//     },
//     {
//         id: "app_005",
//         _id: "674a1b2c3d4e5f6789012349",
//         applicant: {
//             name: {
//                 first: "Kavya",
//                 middle: "",
//                 last: "Nair",
//             },
//             email: "kavya.nair.qa@gmail.com",
//             phone: "9445566778",
//             address: {
//                 street: "23, Anna Salai, T. Nagar",
//                 city: "Chennai",
//                 state: "Tamil Nadu",
//                 pincode: "600017",
//                 country: "India",
//             },
//             imageUrl: "https://randomuser.me/api/portraits/women/5.jpg",
//             dateOfBirth: "1993-02-28T00:00:00.000Z",
//         },
//         job: {
//             id: "job_005",
//             title: "Senior QA Engineer",
//             company: {
//                 id: "comp_005",
//                 name: "QualityFirst Solutions",
//                 imageUrl: "https://logo.clearbit.com/qualityfirst.com",
//             },
//             location: {
//                 city: "Chennai",
//                 state: "Tamil Nadu",
//                 isRemote: false,
//             },
//             salaryRange: "₹10-15 LPA",
//         },
//         applicationStatus: "applied",
//         experienceYears: 5,
//         currentSalary: 950000,
//         expectedSalary: 1300000,
//         noticePeriod: 45,
//         skills: [
//             "Selenium",
//             "TestNG",
//             "Cucumber",
//             "JIRA",
//             "API Testing",
//             "Performance Testing",
//         ],
//         education: {
//             degree: "B.E.",
//             field: "Computer Science",
//             university: "Anna University",
//             graduationYear: 2015,
//         },
//         resumeUrl: "https://example.com/resumes/kavya_nair_resume.pdf",
//         coverLetter:
//             "With 5 years of experience in quality assurance, I am excited about the opportunity...",
//         appliedDate: "2024-12-18T13:20:00.000Z",
//         lastUpdated: "2024-12-18T13:20:00.000Z",
//         interviewScheduled: null,
//         notes: "Application received, need to review",
//         source: "company_website",
//         createdAt: "2024-12-18T13:20:00.000Z",
//         updatedAt: "2024-12-18T13:20:00.000Z",
//     },
// ];

// ==========================================
// CAROUSELS MOCK DATA
// ==========================================

export const CAROUSELS_MOCK_DATA = [
    {
        id: "carousel_001",
        _id: "674a1b2c3d4e5f6789001234",
        title: "Join Our Premium Courses",
        description:
            "Upskill with industry-leading courses designed by experts. Get certified and advance your career.",
        imageUrl:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop",
        mobileImageUrl:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
        link: "/courses",
        buttonText: "Explore Courses",
        order: 1,
        status: 1, // Active
        placement: "homepage_hero",
        targetAudience: "all",
        backgroundColor: "#1890ff",
        textColor: "#ffffff",
        overlayOpacity: 0.4,
        animationType: "fade",
        displayDuration: 5000, // 5 seconds
        startDate: "2024-12-01T00:00:00.000Z",
        endDate: "2025-03-31T23:59:59.000Z",
        clickCount: 1247,
        impressions: 45623,
        createdBy: {
            id: "user_001",
            name: "Admin User",
            email: "admin@company.com",
        },
        createdAt: "2024-12-01T10:00:00.000Z",
        updatedAt: "2024-12-20T15:30:00.000Z",
    },
    {
        id: "carousel_002",
        _id: "674a1b2c3d4e5f6789001235",
        title: "Live Webinars This Week",
        description:
            "Don't miss our expert-led webinars on trending technologies. Register now for free!",
        imageUrl:
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
        mobileImageUrl:
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
        link: "/webinars",
        buttonText: "Register Now",
        order: 2,
        status: 1, // Active
        placement: "homepage_hero",
        targetAudience: "students",
        backgroundColor: "#52c41a",
        textColor: "#ffffff",
        overlayOpacity: 0.3,
        animationType: "slide",
        displayDuration: 4000, // 4 seconds
        startDate: "2024-12-15T00:00:00.000Z",
        endDate: "2025-01-15T23:59:59.000Z",
        clickCount: 892,
        impressions: 32145,
        createdBy: {
            id: "user_002",
            name: "Marketing Manager",
            email: "marketing@company.com",
        },
        createdAt: "2024-12-15T09:30:00.000Z",
        updatedAt: "2024-12-19T11:45:00.000Z",
    },
    {
        id: "carousel_003",
        _id: "674a1b2c3d4e5f6789001236",
        title: "Career Opportunities Await",
        description:
            "Browse through thousands of job listings from top companies. Find your dream job today!",
        imageUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop",
        mobileImageUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
        link: "/jobs",
        buttonText: "Browse Jobs",
        order: 3,
        status: 1, // Active
        placement: "homepage_hero",
        targetAudience: "professionals",
        backgroundColor: "#722ed1",
        textColor: "#ffffff",
        overlayOpacity: 0.5,
        animationType: "zoom",
        displayDuration: 6000, // 6 seconds
        startDate: "2024-11-01T00:00:00.000Z",
        endDate: "2025-02-28T23:59:59.000Z",
        clickCount: 2156,
        impressions: 67891,
        createdBy: {
            id: "user_001",
            name: "Admin User",
            email: "admin@company.com",
        },
        createdAt: "2024-11-01T14:20:00.000Z",
        updatedAt: "2024-12-18T16:15:00.000Z",
    },
    {
        id: "carousel_004",
        _id: "674a1b2c3d4e5f6789001237",
        title: "Special Holiday Offer - 50% Off",
        description:
            "Limited time offer on all premium courses. Use code HOLIDAY50 and save big!",
        imageUrl:
            "https://images.unsplash.com/photo-1607344645866-009c7d0e7b31?w=1200&h=600&fit=crop",
        mobileImageUrl:
            "https://images.unsplash.com/photo-1607344645866-009c7d0e7b31?w=800&h=400&fit=crop",
        link: "/courses?offer=holiday50",
        buttonText: "Claim Offer",
        order: 4,
        status: 0, // Inactive (offer expired)
        placement: "homepage_hero",
        targetAudience: "all",
        backgroundColor: "#fa541c",
        textColor: "#ffffff",
        overlayOpacity: 0.2,
        animationType: "bounce",
        displayDuration: 7000, // 7 seconds
        startDate: "2024-12-01T00:00:00.000Z",
        endDate: "2024-12-31T23:59:59.000Z",
        clickCount: 3421,
        impressions: 89234,
        createdBy: {
            id: "user_002",
            name: "Marketing Manager",
            email: "marketing@company.com",
        },
        createdAt: "2024-12-01T08:00:00.000Z",
        updatedAt: "2025-01-01T00:01:00.000Z",
    },
    {
        id: "carousel_005",
        _id: "674a1b2c3d4e5f6789001238",
        title: "Success Stories",
        description:
            "Read inspiring success stories from our students who transformed their careers with our courses.",
        imageUrl:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=600&fit=crop",
        mobileImageUrl:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop",
        link: "/success-stories",
        buttonText: "Read Stories",
        order: 5,
        status: 1, // Active
        placement: "homepage_secondary",
        targetAudience: "students",
        backgroundColor: "#13c2c2",
        textColor: "#ffffff",
        overlayOpacity: 0.6,
        animationType: "fade",
        displayDuration: 5500, // 5.5 seconds
        startDate: "2024-10-01T00:00:00.000Z",
        endDate: "2025-06-30T23:59:59.000Z",
        clickCount: 756,
        impressions: 23456,
        createdBy: {
            id: "user_003",
            name: "Content Manager",
            email: "content@company.com",
        },
        createdAt: "2024-10-01T12:30:00.000Z",
        updatedAt: "2024-12-10T14:20:00.000Z",
    },
    {
        id: "carousel_006",
        _id: "674a1b2c3d4e5f6789001239",
        title: "Upcoming Tech Conference 2025",
        description:
            "Join industry leaders and tech enthusiasts at our annual conference. Early bird tickets available!",
        imageUrl:
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&h=600&fit=crop",
        mobileImageUrl:
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop",
        link: "/conference-2025",
        buttonText: "Get Tickets",
        order: 6,
        status: -1, // Disabled
        placement: "homepage_hero",
        targetAudience: "professionals",
        backgroundColor: "#2f54eb",
        textColor: "#ffffff",
        overlayOpacity: 0.4,
        animationType: "slide",
        displayDuration: 6000, // 6 seconds
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-04-30T23:59:59.000Z",
        clickCount: 0,
        impressions: 0,
        createdBy: {
            id: "user_002",
            name: "Marketing Manager",
            email: "marketing@company.com",
        },
        createdAt: "2024-12-20T10:00:00.000Z",
        updatedAt: "2024-12-20T10:00:00.000Z",
    },
];

// ==========================================
// FILTER CONFIGURATIONS
// ==========================================

export const JOB_APPLICATIONS_FILTER_CONFIG = {
    applicantName: { type: "text", label: "Applicant Name" },
    applicantEmail: { type: "text", label: "Applicant Email" },
    jobTitle: { type: "text", label: "Job Title" },
    companyName: { type: "text", label: "Company Name" },
    applicationStatus: {
        type: "multi-select",
        label: "Application Status",
        options: [
            { value: "applied", label: "Applied" },
            { value: "under_review", label: "Under Review" },
            { value: "interview_scheduled", label: "Interview Scheduled" },
            { value: "hired", label: "Hired" },
            { value: "rejected", label: "Rejected" },
        ],
    },
    experienceYears: { type: "number-range", label: "Experience (Years)" },
    expectedSalary: { type: "number-range", label: "Expected Salary (₹)" },
    noticePeriod: { type: "number-range", label: "Notice Period (Days)" },
    appliedDate: { type: "date-range", label: "Application Date" },
    source: {
        type: "multi-select",
        label: "Application Source",
        options: [
            { value: "company_website", label: "Company Website" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "job_portal", label: "Job Portal" },
            { value: "referral", label: "Referral" },
            { value: "direct", label: "Direct Application" },
        ],
    },
    skills: { type: "text", label: "Skills" },
    education: { type: "text", label: "Education" },
};

export const JOB_APPLICATIONS_SORT_OPTIONS = [
    { label: "Newest Applications First", value: "-appliedDate" },
    { label: "Oldest Applications First", value: "appliedDate" },
    { label: "By Applicant Name", value: "applicant.name.first" },
    { label: "By Job Title", value: "job.title" },
    { label: "By Experience (High to Low)", value: "-experienceYears" },
    { label: "By Expected Salary (High to Low)", value: "-expectedSalary" },
    { label: "By Application Status", value: "applicationStatus" },
];

export const CAROUSELS_FILTER_CONFIG = {
    title: { type: "text", label: "Title" },
    description: { type: "text", label: "Description" },
    status: {
        type: "multi-select",
        label: "Status",
        options: [
            { value: 1, label: "Active" },
            { value: 0, label: "Inactive" },
            { value: -1, label: "Disabled" },
        ],
    },
    placement: {
        type: "multi-select",
        label: "Placement",
        options: [
            { value: "homepage_hero", label: "Homepage Hero" },
            { value: "homepage_secondary", label: "Homepage Secondary" },
            { value: "courses_page", label: "Courses Page" },
            { value: "jobs_page", label: "Jobs Page" },
            { value: "webinars_page", label: "Webinars Page" },
        ],
    },
    targetAudience: {
        type: "multi-select",
        label: "Target Audience",
        options: [
            { value: "all", label: "All Users" },
            { value: "students", label: "Students" },
            { value: "professionals", label: "Professionals" },
            { value: "job_seekers", label: "Job Seekers" },
        ],
    },
    animationType: {
        type: "multi-select",
        label: "Animation Type",
        options: [
            { value: "fade", label: "Fade" },
            { value: "slide", label: "Slide" },
            { value: "zoom", label: "Zoom" },
            { value: "bounce", label: "Bounce" },
        ],
    },
    displayDuration: { type: "number-range", label: "Display Duration (ms)" },
    order: { type: "number-range", label: "Display Order" },
    startDate: { type: "date-range", label: "Start Date" },
    endDate: { type: "date-range", label: "End Date" },
    createdAt: { type: "date-range", label: "Created Date" },
};

export const CAROUSELS_SORT_OPTIONS = [
    { label: "By Display Order", value: "order" },
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
    { label: "By Title", value: "title" },
    { label: "By Status", value: "-status" },
    { label: "Most Clicked", value: "-clickCount" },
    { label: "Most Impressions", value: "-impressions" },
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const getJobApplicationStatusColor = (status) => {
    const statusColors = {
        applied: "#1890ff",
        under_review: "#faad14",
        interview_scheduled: "#722ed1",
        hired: "#52c41a",
        rejected: "#ff4d4f",
    };
    return statusColors[status] || "#d9d9d9";
};

export const getJobApplicationStatusLabel = (status) => {
    const statusLabels = {
        applied: "Applied",
        under_review: "Under Review",
        interview_scheduled: "Interview Scheduled",
        hired: "Hired",
        rejected: "Rejected",
    };
    return statusLabels[status] || "Unknown";
};

export const getCarouselStatusColor = (status) => {
    const statusColors = {
        1: "#52c41a", // Active - green
        0: "#faad14", // Inactive - yellow
        [-1]: "#ff4d4f", // Disabled - red
    };
    return statusColors[status] || "#d9d9d9";
};

export const getCarouselStatusLabel = (status) => {
    const statusLabels = {
        1: "Active",
        0: "Inactive",
        [-1]: "Disabled",
    };
    return statusLabels[status] || "Unknown";
};

export const formatSalary = (amount) => {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)} L`;
    } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)} K`;
    }
    return `₹${amount}`;
};

export const calculateApplicationMetrics = (applications) => {
    const total = applications.length;
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.applicationStatus] = (acc[app.applicationStatus] || 0) + 1;
        return acc;
    }, {});

    return {
        total,
        applied: statusCounts.applied || 0,
        under_review: statusCounts.under_review || 0,
        interview_scheduled: statusCounts.interview_scheduled || 0,
        hired: statusCounts.hired || 0,
        rejected: statusCounts.rejected || 0,
        conversionRate:
            total > 0
                ? (((statusCounts.hired || 0) / total) * 100).toFixed(1)
                : 0,
    };
};

export const calculateCarouselMetrics = (carousels) => {
    const total = carousels.length;
    const active = carousels.filter((c) => c.status === 1).length;
    const inactive = carousels.filter((c) => c.status === 0).length;
    const disabled = carousels.filter((c) => c.status === -1).length;

    const totalClicks = carousels.reduce((sum, c) => sum + c.clickCount, 0);
    const totalImpressions = carousels.reduce(
        (sum, c) => sum + c.impressions,
        0
    );
    const avgCTR =
        totalImpressions > 0
            ? ((totalClicks / totalImpressions) * 100).toFixed(2)
            : 0;

    return {
        total,
        active,
        inactive,
        disabled,
        totalClicks,
        totalImpressions,
        avgCTR: `${avgCTR}%`,
    };
};

export const JOB_APPLICATIONS_MOCK_DATA = [
    {
        id: "1",
        _id: "1",
        jobId: "job_001",
        userId: "user_001",
        status: 0, // 0: Applied, 1: Under Review, 2: Interview Scheduled, 3: Accepted, 4: Rejected
        appliedDate: "2024-01-15T10:30:00Z",
        lastUpdated: "2024-01-20T14:45:00Z",
        resume: "https://example.com/resumes/john_doe_resume.pdf",
        coverLetter:
            "I am very interested in this position and believe my skills align well with your requirements...",
        expectedSalary: 850000,
        noticePeriod: 30, // days
        currentCompany: "Tech Solutions Ltd",
        totalExperience: 3.5, // years
        relevantExperience: 2.0,
        notes: "Strong candidate with good technical skills",

        // Populated job details
        jobDetails: {
            title: "Senior Frontend Developer",
            company: {
                name: "Innovative Tech Corp",
                imageUrl: "https://example.com/logos/innovative-tech.png",
            },
            location: {
                city: "Bangalore",
                state: "Karnataka",
            },
            salaryRange: "₹8,00,000 - ₹12,00,000",
            type: 3, // Full-time
        },

        // Populated user details
        userDetails: {
            name: {
                first: "John",
                middle: "Kumar",
                last: "Doe",
            },
            email: "john.doe@email.com",
            phone1: "9876543210",
            imageUrl: "https://example.com/avatars/john_doe.jpg",
            address: {
                city: "Bangalore",
                state: "Karnataka",
            },
        },

        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-20T14:45:00Z",
    },
    {
        id: "2",
        _id: "2",
        jobId: "job_002",
        userId: "user_002",
        status: 1,
        appliedDate: "2024-01-16T09:15:00Z",
        lastUpdated: "2024-01-22T11:30:00Z",
        resume: "https://example.com/resumes/jane_smith_resume.pdf",
        coverLetter:
            "With 5 years of experience in backend development, I am excited about this opportunity...",
        expectedSalary: 1200000,
        noticePeriod: 60,
        currentCompany: "Digital Innovations Pvt Ltd",
        totalExperience: 5.0,
        relevantExperience: 4.5,
        notes: "Excellent backend experience, good cultural fit",

        jobDetails: {
            title: "Backend Developer",
            company: {
                name: "Future Systems Inc",
                imageUrl: "https://example.com/logos/future-systems.png",
            },
            location: {
                city: "Mumbai",
                state: "Maharashtra",
            },
            salaryRange: "₹10,00,000 - ₹15,00,000",
            type: 3,
        },

        userDetails: {
            name: {
                first: "Jane",
                middle: "",
                last: "Smith",
            },
            email: "jane.smith@email.com",
            phone1: "9876543211",
            imageUrl: "https://example.com/avatars/jane_smith.jpg",
            address: {
                city: "Mumbai",
                state: "Maharashtra",
            },
        },

        createdAt: "2024-01-16T09:15:00Z",
        updatedAt: "2024-01-22T11:30:00Z",
    },
    {
        id: "3",
        _id: "3",
        jobId: "job_001",
        userId: "user_003",
        status: 2,
        appliedDate: "2024-01-17T14:20:00Z",
        lastUpdated: "2024-01-25T16:00:00Z",
        resume: "https://example.com/resumes/alex_wilson_resume.pdf",
        coverLetter:
            "I have been following your company's growth and would love to contribute...",
        expectedSalary: 900000,
        noticePeriod: 45,
        currentCompany: "StartupXYZ",
        totalExperience: 4.0,
        relevantExperience: 3.0,
        notes: "Interview scheduled for next week",
        interviewDate: "2024-01-30T10:00:00Z",

        jobDetails: {
            title: "Senior Frontend Developer",
            company: {
                name: "Innovative Tech Corp",
                imageUrl: "https://example.com/logos/innovative-tech.png",
            },
            location: {
                city: "Bangalore",
                state: "Karnataka",
            },
            salaryRange: "₹8,00,000 - ₹12,00,000",
            type: 3,
        },

        userDetails: {
            name: {
                first: "Alex",
                middle: "Kumar",
                last: "Wilson",
            },
            email: "alex.wilson@email.com",
            phone1: "9876543212",
            imageUrl: "https://example.com/avatars/alex_wilson.jpg",
            address: {
                city: "Bangalore",
                state: "Karnataka",
            },
        },

        createdAt: "2024-01-17T14:20:00Z",
        updatedAt: "2024-01-25T16:00:00Z",
    },
    {
        id: "4",
        _id: "4",
        jobId: "job_003",
        userId: "user_004",
        status: 3,
        appliedDate: "2024-01-10T11:45:00Z",
        lastUpdated: "2024-01-28T13:15:00Z",
        resume: "https://example.com/resumes/sarah_johnson_resume.pdf",
        coverLetter:
            "As a UI/UX designer with a passion for creating intuitive user experiences...",
        expectedSalary: 750000,
        noticePeriod: 30,
        currentCompany: "Design Studio Pro",
        totalExperience: 3.0,
        relevantExperience: 3.0,
        notes: "Excellent portfolio, accepted the offer",
        offerLetter: "https://example.com/offers/sarah_johnson_offer.pdf",

        jobDetails: {
            title: "UI/UX Designer",
            company: {
                name: "Creative Solutions Ltd",
                imageUrl: "https://example.com/logos/creative-solutions.png",
            },
            location: {
                city: "Pune",
                state: "Maharashtra",
            },
            salaryRange: "₹6,00,000 - ₹9,00,000",
            type: 3,
        },

        userDetails: {
            name: {
                first: "Sarah",
                middle: "",
                last: "Johnson",
            },
            email: "sarah.johnson@email.com",
            phone1: "9876543213",
            imageUrl: "https://example.com/avatars/sarah_johnson.jpg",
            address: {
                city: "Pune",
                state: "Maharashtra",
            },
        },

        createdAt: "2024-01-10T11:45:00Z",
        updatedAt: "2024-01-28T13:15:00Z",
    },
    {
        id: "5",
        _id: "5",
        jobId: "job_004",
        userId: "user_005",
        status: 4,
        appliedDate: "2024-01-12T16:30:00Z",
        lastUpdated: "2024-01-26T10:20:00Z",
        resume: "https://example.com/resumes/mike_brown_resume.pdf",
        coverLetter: "I am writing to apply for the Data Scientist position...",
        expectedSalary: 1400000,
        noticePeriod: 90,
        currentCompany: "Analytics Corp",
        totalExperience: 6.0,
        relevantExperience: 5.0,
        notes: "Overqualified for the position, expectations too high",
        rejectionReason: "Salary expectations beyond budget",

        jobDetails: {
            title: "Data Scientist",
            company: {
                name: "AI Innovations Pvt Ltd",
                imageUrl: "https://example.com/logos/ai-innovations.png",
            },
            location: {
                city: "Hyderabad",
                state: "Telangana",
            },
            salaryRange: "₹10,00,000 - ₹13,00,000",
            type: 3,
        },

        userDetails: {
            name: {
                first: "Mike",
                middle: "Kumar",
                last: "Brown",
            },
            email: "mike.brown@email.com",
            phone1: "9876543214",
            imageUrl: "https://example.com/avatars/mike_brown.jpg",
            address: {
                city: "Hyderabad",
                state: "Telangana",
            },
        },

        createdAt: "2024-01-12T16:30:00Z",
        updatedAt: "2024-01-26T10:20:00Z",
    },
];

// Application Status mapping
export const APPLICATION_STATUS = {
    0: { label: "Applied", color: "blue" },
    1: { label: "Under Review", color: "orange" },
    2: { label: "Interview Scheduled", color: "purple" },
    3: { label: "Hired", color: "green" },
    4: { label: "Rejected", color: "red" },
    5: { label: "Withdrawn", color: "default" },
};

// Job Type mapping
export const JOB_TYPE = {
    0: "Internship",
    1: "Contract",
    2: "Part-time",
    3: "Full-time",
};
