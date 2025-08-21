// Tutor Dashboard Script with Authentication Guards
// Handles tutor dashboard functionality with session management

// Tutor Dashboard JavaScript
// This file handles the main dashboard functionality with sample data
// Ready for Supabase integration later

// Placeholder for current user ID - will be replaced with Supabase auth
const currentUserId = 123;

// Sample data arrays - will be replaced with Supabase queries
const sampleApplications = [
    {
        id: 1,
        title: "Mathematics - Grade 10",
        subject: "Mathematics",
        classLevel: "Grade 10",
        student: "Ahmed Khan",
        status: "pending",
        location: "Dhaka",
        appliedDate: "2024-01-15"
    },
    {
        id: 2,
        title: "English - Grade 8",
        subject: "English",
        classLevel: "Grade 8",
        student: "Fatima Rahman",
        status: "accepted",
        location: "Chittagong",
        appliedDate: "2024-01-10"
    },
    {
        id: 3,
        title: "Physics - Grade 11",
        subject: "Physics",
        classLevel: "Grade 11",
        student: "Zara Ahmed",
        status: "pending",
        location: "Dhaka",
        appliedDate: "2024-01-18"
    }
];

const sampleTuitionRequests = [
    {
        id: 1,
        subject: "Physics",
        classLevel: "Grade 11",
        location: "Dhaka",
        type: "Online",
        details: "Need help with exam preparation.",
        budget: "৳800/hour",
        student: "Parent of Grade 11 student"
    },
    {
        id: 2,
        subject: "Chemistry",
        classLevel: "Grade 9",
        location: "Kohaino",
        type: "In-person",
        details: "Weekly sessions required.",
        budget: "৳600/hour",
        student: "Parent of Grade 9 student"
    },
    {
        id: 3,
        subject: "Biology",
        classLevel: "Grade 12",
        location: "Chittagong",
        type: "Online",
        details: "Focus on genetics and evolution.",
        budget: "৳1000/hour",
        student: "Parent of Grade 12 student"
    },
    {
        id: 4,
        subject: "Mathematics",
        classLevel: "Grade 7",
        location: "Dhaka",
        type: "In-person",
        details: "Basic math concepts and problem solving.",
        budget: "৳500/hour",
        student: "Parent of Grade 7 student"
    },
    {
        id: 5,
        subject: "English Literature",
        classLevel: "Grade 10",
        location: "Sylhet",
        type: "Online",
        details: "Essay writing and literature analysis.",
        budget: "৳700/hour",
        student: "Parent of Grade 10 student"
    }
];

const sampleReviews = [
    {
        id: 1,
        rating: 5,
        comment: "Great tutor! Helped my son improve his grades significantly.",
        author: "Parent",
        location: "Dhaka",
        date: "2024-01-10"
    },
    {
        id: 2,
        rating: 4,
        comment: "Very patient and knowledgeable. Explains complex topics clearly.",
        author: "Student",
        location: "Chittagong",
        date: "2024-01-05"
    },
    {
        id: 3,
        rating: 5,
        comment: "Excellent teaching methods. My daughter loves the sessions.",
        author: "Parent",
        location: "Dhaka",
        date: "2024-01-12"
    }
];

// Badge update functions
function updateBadges() {
    // Update applications badge (pending count)
    const pendingApps = sampleApplications.filter(app => app.status === 'pending').length;
    const appsBadge = document.getElementById('badge-apps');
    if (appsBadge) {
        appsBadge.textContent = pendingApps;
        appsBadge.style.display = pendingApps > 0 ? 'flex' : 'none';
    }

    // Update tuition requests badge (total count)
    const requestsBadge = document.getElementById('badge-requests');
    if (requestsBadge) {
        requestsBadge.textContent = sampleTuitionRequests.length;
    }

    // Update messages badge (dot indicator for unread)
    const msgBadge = document.getElementById('badge-msg');
    if (msgBadge) {
        // Placeholder for unread messages count
        const unreadCount = 3; // This will come from Supabase later
        msgBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    // Update notification bell badge (sum of all)
    const bellBadge = document.getElementById('badge-bell');
    if (bellBadge) {
        const totalNotifications = pendingApps + sampleTuitionRequests.length + 3; // +3 for unread messages
        bellBadge.textContent = totalNotifications;
        bellBadge.style.display = totalNotifications > 0 ? 'flex' : 'none';
    }
}

// Render functions
function renderApplications(data) {
    const list = document.getElementById('applications-list');
    if (!list) return;

    list.innerHTML = '';
    
    // Filter applications for current tutor (will be replaced with Supabase query)
    const tutorApplications = data.filter(app => app.tutor_id === currentUserId || true); // Show all for demo
    
    tutorApplications.forEach(app => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${app.title}</strong><br>
            Student: ${app.student}<br>
            Status: <span class="status ${app.status}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span><br>
            Location: ${app.location}<br>
            Applied: ${new Date(app.appliedDate).toLocaleDateString()}
            <div class="actions">
                <button onclick="viewApplication(${app.id})">View</button>
                <button class="secondary" onclick="messageStudent(${app.student})">Message</button>
                <button class="secondary report-btn" title="Report this student"
                        data-reported-user="${app.student_id || ''}"
                        data-content-id="application-${app.id}">
                    Report
                </button>
            </div>
        `;
        list.appendChild(li);
    });
}

function renderTuitionRequests(data) {
    const list = document.getElementById('tuition-requests-list');
    if (!list) return;

    list.innerHTML = '';
    
    // Exclude requests denied by this tutor
    const denied = (window.deniedRequests || []).filter(d => d.tutor_id === currentUserId).map(d => Number(d.request_id));
    const filteredRequests = data.filter(req => !denied.includes(req.id));

    filteredRequests.forEach(req => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${req.subject} - ${req.classLevel}</strong><br>
            Location: ${req.location} | Type: ${req.type}<br>
            Budget: ${req.budget}<br>
            <span style="color:#b8c1ec;">${req.details}</span><br>
            <small style="color:#eeb7b7;">- ${req.student}</small>
            <div class="actions">
                <button onclick="applyToRequest(${req.id})">Apply</button>
                <button class="secondary" onclick="viewRequest(${req.id})">View</button>
                <button class="secondary" style="background: rgba(255, 59, 48, 0.15); color: #ff3b30; border: 1px solid rgba(255,59,48,0.35);" onclick="denyRequest(${req.id}, ${currentUserId})">Deny</button>
                <button class="secondary report-btn" title="Report this request"
                        data-reported-user="${req.student || ''}"
                        data-content-id="request-${req.id}">
                    Report
                </button>
            </div>
        `;
        list.appendChild(li);
    });
}

function renderReviews(data) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    list.innerHTML = '';
    
    // Filter reviews for current tutor (will be replaced with Supabase query)
    const tutorReviews = data.filter(review => review.tutor_id === currentUserId || true); // Show all for demo
    
    tutorReviews.forEach(review => {
        const li = document.createElement('li');
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        li.innerHTML = `
            <div class="review-rating">${stars}</div>
            "${review.comment}"
            <div style="font-size:0.95rem;color:#eeb7b7;">- ${review.author}, ${review.location}</div>
            <small style="color:#b8c1ec;">${new Date(review.date).toLocaleDateString()}</small>
        `;
        list.appendChild(li);
    });
}

// Action functions (placeholders for now)
function viewApplication(appId) {
    console.log(`Viewing application ${appId}`);
    // Will navigate to application detail page or show modal
    // const { data, error } = await supabase.from("applications").select("*").eq("id", appId);
}

function messageStudent(studentName) {
    console.log(`Messaging student: ${studentName}`);
    // Will navigate to messages page or open chat
    // const { data, error } = await supabase.from("conversations").select("*").eq("participants", [currentUserId, studentId]);
}

async function applyToRequest(requestId) {
    try {
        const supabase = window.getSupabaseClient?.();
        const currentUser = window.auth?.getCurrentUser?.();
        if (supabase && currentUser?.id) {
            const { data, error } = await supabase
                .from('applications')
                .insert({
                    request_id: requestId,
                    tutor_id: currentUser.id,
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
            if (error) throw error;
            alert('Applied successfully!');
            // Optionally refresh UI badges/lists
            updateBadges();
            return data;
        }
    } catch (e) {
        console.error('Failed to apply via Supabase:', e);
    }
    // Fallback: push into a mock array
    const offlineUserId = window.auth?.getCurrentUser?.()?.id || 0;
    window.mockApplications = Array.isArray(window.mockApplications) ? window.mockApplications : [];
    window.mockApplications.push({ id: Date.now(), request_id: requestId, tutor_id: offlineUserId, status: 'pending', created_at: new Date().toISOString() });
    alert('Applied (offline mode).');
    if (typeof loadTuitionRequests === 'function') {
        loadTuitionRequests();
    }
}

function viewRequest(requestId) {
    console.log(`Viewing request ${requestId}`);
    // Will show request details
    // const { data, error } = await supabase.from("tuition_requests").select("*").eq("id", requestId);
}

async function denyRequest(requestId, tutorId) {
    if (!confirm('Are you sure you want to deny this request?')) return;
    if (!window.deniedRequests) window.deniedRequests = [];
    const exists = window.deniedRequests.some(d => d.tutor_id === tutorId && Number(d.request_id) === Number(requestId));
    if (!exists) {
        window.deniedRequests.push({ tutor_id: tutorId, request_id: requestId, status: 'denied', created_at: new Date().toISOString() });
    }

    // Try to record denial in Supabase via applications table
    try {
        const supabase = window.getSupabaseClient?.();
        if (supabase) {
            // Try update first
            const { data: updated, error: updErr } = await supabase
                .from('applications')
                .update({ status: 'denied' })
                .eq('request_id', requestId)
                .eq('tutor_id', tutorId)
                .select();
            if (updErr) throw updErr;
            if (!updated || updated.length === 0) {
                // Insert if no existing application
                const { error: insErr } = await supabase
                    .from('applications')
                    .insert({ request_id: requestId, tutor_id: tutorId, status: 'denied', created_at: new Date().toISOString() });
                if (insErr) throw insErr;
            }
        }
    } catch (e) {
        console.warn('Could not persist denial to Supabase, using offline only:', e);
    }

    // Refresh lists
    if (typeof loadTuitionRequests === 'function') {
        loadTuitionRequests();
    } else {
        renderTuitionRequests(sampleTuitionRequests);
    }
}

// Supabase integration placeholders
async function loadApplicationsFromSupabase() {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //     .from("applications")
    //     .select("*")
    //     .eq("tutor_id", currentUserId)
    //     .order("created_at", { ascending: false });
    
    // if (error) {
    //     console.error("Error loading applications:", error);
    //     return [];
    // }
    
    // return data;
    return sampleApplications;
}

async function loadTuitionRequestsFromSupabase() {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //     .from("tuition_requests")
    //     .select("*")
    //     .eq("status", "open")
    //     .order("created_at", { ascending: false });
    
    // if (error) {
    //     console.error("Error loading tuition requests:", error);
    //     return [];
    // }
    
    // return data;
    return sampleTuitionRequests;
}

async function loadReviewsFromSupabase() {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //     .from("reviews")
    //     .select("*")
    //     .eq("tutor_id", currentUserId)
    //     .order("created_at", { ascending: false });
    
    // if (error) {
    //     console.error("Error loading reviews:", error);
    //     return [];
    // }
    
    // return data;
    return sampleReviews;
}

// Load applications data
async function loadApplications() {
    try {
        const currentUser = window.auth?.getCurrentUser?.();
        if (!currentUser) return;
        const appsUtil = window.applications;
        if (appsUtil?.fetchApplications) {
            const apps = await appsUtil.fetchApplications({ tutor_id: currentUser.id });
            // Map to UI structure expected by renderApplications()
            const mapped = (apps || []).map(a => {
                const req = a.tuition_request || a.requests || {};
                return {
                    id: a.id,
                    title: `${req.subject || 'Subject'} - ${req.class_level || req.class || ''}`.trim(),
                    subject: req.subject || 'Subject',
                    classLevel: req.class_level || req.class || 'N/A',
                    student: req.student_id ? `Student ${req.student_id}` : 'Student',
                    student_id: req.student_id || null,
                    status: a.status || 'pending',
                    location: req.location || 'N/A',
                    appliedDate: a.created_at || new Date().toISOString()
                };
            });
            renderApplications(mapped);
            return;
        }
        // Fallback to mock data
        renderApplications(sampleApplications);
    } catch (error) {
        console.error('Error loading applications:', error);
        renderApplications(sampleApplications);
    }
}

// Load tuition requests data
async function loadTuitionRequests() {
    try {
        // 🔑 Supabase Query: Get available tuition requests from 'requests'
        const supabase = window.getSupabaseClient();
        if (supabase) {
            const { data, error } = await supabase
                .from('requests')
                .select('id, subject, class, location, tuition_type, salary_range, details, student_id, created_at')
                .eq('status', 'open')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            // Map to UI structure
            const mapped = (data || []).map(r => ({
                id: r.id,
                subject: r.subject,
                classLevel: r.class || r.class_level || 'N/A',
                location: r.location,
                type: r.tuition_type === 'Home Tuition' || r.tuition_type === 'home' ? 'In-person' : 'Online',
                details: r.details || '',
                budget: r.salary_range || '',
                student: r.student_id || 'Student'
            }));
            renderTuitionRequests(mapped);
        } else {
            // Fallback to mock data
            renderTuitionRequests(sampleTuitionRequests);
        }
    } catch (error) {
        console.error('Error loading tuition requests:', error);
        renderTuitionRequests(sampleTuitionRequests);
    }
}

// Load reviews data
async function loadReviews() {
    try {
        // 🔑 Supabase Query: Get tutor's reviews
        const supabase = window.getSupabaseClient();
        if (supabase) {
            const currentUser = window.auth?.getCurrentUser();
            if (!currentUser) return;

            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('tutor_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(3);

            if (error) throw error;
            renderReviews(data || []);
        } else {
            // Fallback to mock data
            renderReviews(sampleReviews);
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        renderReviews(sampleReviews);
    }
}

// Initialize notification bell
function initNotificationBell() {
    const notificationBell = document.getElementById('notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            console.log('Notification bell clicked');
            // Calculate notification count
            const count = calculateNotificationCount();
            updateNotificationBadge(count);
            
            // Show notification summary
            showNotificationSummary(count);
        });
    }
}

// Calculate notification count
function calculateNotificationCount() {
    // This would come from Supabase in real implementation
    // For now, return mock count
    return Math.floor(Math.random() * 10) + 1;
}

// Update notification badge
function updateNotificationBadge(count) {
    const badge = document.getElementById('badge-bell');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

// Show notification summary
function showNotificationSummary(count) {
    alert(`You have ${count} new notifications!\n\n• ${Math.floor(count/2)} new tuition requests\n• ${Math.floor(count/3)} application updates\n• ${Math.floor(count/4)} messages`);
}

// Show error message
function showErrorMessage(message) {
    console.error(message);
    // You can implement a proper error display UI here
}

// Initialize dashboard with authentication guard
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 🔐 Authentication Guard
        const authResult = await window.auth?.initAuth(['tutor'], 'login.html');
        if (!authResult) {
            console.log('Authentication failed, redirecting...');
            return;
        }

        // Initialize dashboard components
        await initializeDashboard();
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        // Redirect to login on error
        window.location.href = 'login.html';
    }
});

// Initialize dashboard components
async function initializeDashboard() {
    try {
        // Load user data
        const currentUser = window.auth?.getCurrentUser();
        if (currentUser) {
            // Update dashboard header with user info
            updateDashboardHeader(currentUser);
        }

        // Load dashboard data
        await Promise.all([
            loadApplications(),
            loadTuitionRequests(),
            loadReviews()
        ]);

        // Initialize notification bell
        initNotificationBell();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showErrorMessage('Failed to load dashboard data. Please refresh the page.');
    }
}

// Update dashboard header with user information
function updateDashboardHeader(user) {
    const headerTitle = document.querySelector('.topbar h1');
    if (headerTitle) {
        headerTitle.innerHTML = `<i class="fas fa-tachometer-alt"></i> Welcome, ${user.email.split('@')[0]}`;
    }
}

// Export functions for potential use in other modules
window.tutorDashboard = {
    renderApplications,
    renderTuitionRequests,
    renderReviews,
    updateBadges,
    loadApplicationsFromSupabase,
    loadTuitionRequestsFromSupabase,
    loadReviewsFromSupabase
};
