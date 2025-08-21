// Mock data for TutorBridge admin dashboard
(function() {
    // Mock Users
    window.mockUsers = [
        {
            id: 1,
            name: "John Smith",
            email: "john@example.com",
            role: "tutor",
            status: "active",
            created_at: "2024-01-15T10:30:00Z"
        },
        {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah@example.com",
            role: "student",
            status: "active",
            created_at: "2024-01-20T14:15:00Z"
        },
        {
            id: 3,
            name: "Mike Wilson",
            email: "mike@example.com",
            role: "tutor",
            status: "pending",
            created_at: "2024-02-01T09:00:00Z"
        },
        {
            id: 4,
            name: "Lisa Brown",
            email: "lisa@example.com",
            role: "tutor",
            status: "pending",
            created_at: "2024-02-15T16:45:00Z"
        },
        {
            id: 5,
            name: "David Lee",
            email: "david@example.com",
            role: "student",
            status: "blocked",
            created_at: "2024-01-10T11:20:00Z"
        },
        {
            id: 6,
            name: "T.Ahmed",
            email: "tasdidahmed.official@gmail.com",
            role: "admin",
            status: "active",
            created_at: "2024-01-10T11:32:00Z"
        }
    ];

    // Mock Requests
    window.mockRequests = [
        {
            id: 1,
            subject: "Mathematics",
            location: "New York, NY",
            student_id: 2,
            student_name: "Sarah Johnson",
            status: "open",
            created_at: "2024-02-20T10:00:00Z",
            description: "Need help with calculus"
        },
        {
            id: 2,
            subject: "Physics",
            location: "Los Angeles, CA",
            student_id: 2,
            student_name: "Sarah Johnson",
            status: "matched",
            created_at: "2024-02-18T14:30:00Z",
            description: "High school physics tutoring"
        },
        {
            id: 3,
            subject: "English Literature",
            location: "Chicago, IL",
            student_id: 5,
            student_name: "David Lee",
            status: "closed",
            created_at: "2024-02-15T09:15:00Z",
            description: "Essay writing help"
        }
    ];

    // Mock Reports
    window.mockReports = [
        {
            id: 1,
            reported_by: "John Smith",
            reason: "Inappropriate behavior",
            content_type: "User Profile",
            status: "pending",
            created_at: "2024-02-21T12:00:00Z",
            description: "User posted inappropriate content"
        },
        {
            id: 2,
            reported_by: "Sarah Johnson",
            reason: "Spam content",
            content_type: "Message",
            status: "resolved",
            created_at: "2024-02-20T15:30:00Z",
            description: "Received spam messages"
        },
        {
            id: 3,
            reported_by: "Mike Wilson",
            reason: "Fake credentials",
            content_type: "User Profile",
            status: "pending",
            created_at: "2024-02-19T11:45:00Z",
            description: "Tutor claims fake qualifications"
        }
    ];

    // Mock Payments
    window.mockPayments = [
        {
            id: 1,
            match_id: 1,
            student_id: 2,
            tutor_id: 1,
            request_id: 2,
            amount_total: 500,
            payment_status: "received",
            created_at: "2024-02-18T16:00:00Z"
        },
        {
            id: 2,
            match_id: 2,
            student_id: 5,
            tutor_id: 3,
            request_id: 3,
            amount_total: 750,
            payment_status: "pending",
            created_at: "2024-02-15T10:30:00Z"
        }
    ];

    // Mock Commissions
    window.mockCommissions = [
        {
            id: 1,
            payment_id: 1,
            commission_amount: 50,
            commission_rate: 0.10,
            collection_status: "collected",
            created_at: "2024-02-18T16:00:00Z",
            collected_at: "2024-02-19T09:00:00Z"
        },
        {
            id: 2,
            payment_id: 2,
            commission_amount: 75,
            commission_rate: 0.10,
            collection_status: "pending",
            created_at: "2024-02-15T10:30:00Z"
        }
    ];

    // Mock Matches
    window.mockMatches = [
        {
            id: 1,
            request_id: 2,
            tutor_id: 1,
            student_id: 2,
            created_at: "2024-02-18T14:30:00Z"
        },
        {
            id: 2,
            request_id: 3,
            tutor_id: 3,
            student_id: 5,
            created_at: "2024-02-15T09:15:00Z"
        }
    ];

    console.log('Mock data loaded successfully');
})();
