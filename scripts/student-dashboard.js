// scripts/student-dashboard.js
// Student Dashboard Script with Authentication Guards
// Handles student dashboard functionality with session management

// Initialize dashboard with authentication guard
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 🔐 Authentication Guard
        const authResult = await window.auth?.initAuth(['student'], 'login.html');
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

/**
 * Initialize the dashboard with all data
 */
async function initializeDashboard() {
    try {
        // Load user data
        const currentUser = window.auth?.getCurrentUser();
        if (currentUser) {
            // Update dashboard header with user info
            updateDashboardHeader(currentUser);
        }

        // Show loading states initially
        showLoadingStates();
        
        // Load dashboard data
        await Promise.all([
            loadMyRequests(),
            loadApplicationsReceived(),
            loadMyConversations()
        ]);
        
        // Update all badges
        updateAllBadges();
        
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showErrorStates();
    }
}

/**
 * Show loading states for all sections
 */
function showLoadingStates() {
    document.getElementById('loading-requests').style.display = 'block';
    document.getElementById('loading-applications').style.display = 'block';
    document.getElementById('loading-messages').style.display = 'block';
    
    document.getElementById('requestsList').style.display = 'none';
    document.getElementById('applicationsList').style.display = 'none';
    document.getElementById('messagesList').style.display = 'none';
    
    document.getElementById('empty-requests').style.display = 'none';
    document.getElementById('empty-applications').style.display = 'none';
    document.getElementById('empty-messages').style.display = 'none';
}

/**
 * Show error states for all sections
 */
function showErrorStates() {
    // Hide loading states
    document.getElementById('loading-requests').style.display = 'none';
    document.getElementById('loading-applications').style.display = 'none';
    document.getElementById('loading-messages').style.display = 'none';
    
    // Show empty states with error messages
    document.getElementById('empty-requests').style.display = 'block';
    document.getElementById('empty-applications').style.display = 'block';
    document.getElementById('empty-messages').style.display = 'block';
}

// ============================================================================
// DATA FETCHING FUNCTIONS (Sample data now, Supabase later)
// ============================================================================

/**
 * Fetch my tuition requests from Supabase with fallback
 * @returns {Promise<Array>} Array of tuition requests (mapped for UI)
 */
async function fetchMyRequests() {
    try {
        const supabase = window.getSupabaseClient?.();
        const currentUser = window.auth?.getCurrentUser?.();
        if (supabase && currentUser?.id) {
            const { data, error } = await supabase
                .from('requests')
                .select('id, subject, class, location, tuition_type, salary_range, status, created_at')
                .eq('student_id', currentUser.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(r => ({
                id: r.id,
                subject: r.subject,
                classLevel: r.class || r.class_level || 'N/A',
                curriculum: '',
                location: r.location,
                tuitionType: r.tuition_type || 'Online',
                daysPerWeek: null,
                duration: null,
                salaryRange: r.salary_range || '',
                status: r.status || 'open',
                createdAt: r.created_at
            }));
        }
    } catch (e) {
        console.warn('fetchMyRequests Supabase failed, using fallback:', e);
    }
    // Fallback sample data
    return [
        {
            id: 1,
            subject: "Physics",
            classLevel: "Grade 11",
            curriculum: "Cambridge",
            location: "Dhaka",
            tuitionType: "Home Tuition",
            daysPerWeek: 3,
            duration: "2 hours",
            salaryRange: "৳2000-3000",
            status: "open",
            createdAt: "2024-01-15"
        },
        {
            id: 2,
            subject: "Chemistry",
            classLevel: "Grade 9",
            curriculum: "Edexcel",
            location: "Kohaino",
            tuitionType: "Online",
            daysPerWeek: 2,
            duration: "1.5 hours",
            salaryRange: "৳1500-2500",
            status: "closed",
            createdAt: "2024-01-10"
        },
        {
            id: 3,
            subject: "Biology",
            classLevel: "Grade 12",
            curriculum: "Cambridge",
            location: "Chittagong",
            tuitionType: "Home Tuition",
            daysPerWeek: 4,
            duration: "2.5 hours",
            salaryRange: "৳2500-3500",
            status: "open",
            createdAt: "2024-01-20"
        }
    ];
}

// Fetch applications received for my requests
async function fetchApplicationsReceived() {
    try {
        const currentUser = window.auth?.getCurrentUser?.();
        if (!currentUser) return [];
        const appsUtil = window.applications;
        if (appsUtil?.fetchApplications) {
            const apps = await appsUtil.fetchApplications({ student_id: currentUser.id });
            // Map to UI structure expected by renderApplications()
            return (apps || []).map(a => ({
                id: a.id,
                status: a.status || 'pending',
                message: a.message || '',
                createdAt: a.created_at,
                tutorName: a.tutor_name || a.tutor?.name || `Tutor ${a.tutor_id || ''}`,
                tutorRating: a.tutor_rating || 4.5,
                tutorExperience: a.tutor_experience || '2+ years',
                request_id: a.request_id,
                tutor_id: a.tutor_id
            }));
        }
    } catch (e) {
        console.warn('fetchApplicationsReceived fallback:', e);
    }
    // Fallback to mock applications if present
    const mocked = Array.isArray(window.mockApplications) ? window.mockApplications : [];
    return mocked.map(a => ({
        id: a.id,
        status: a.status || 'pending',
        message: a.message || '',
        createdAt: a.created_at,
        tutorName: `Tutor ${a.tutor_id || ''}`,
        tutorRating: 4.5,
        tutorExperience: '2+ years',
        request_id: a.request_id,
        tutor_id: a.tutor_id
    }));
}

// ============================================================================
// LOADING FUNCTIONS
// ============================================================================

/**
 * Load and render my requests
 */
async function loadMyRequests() {
    try {
        const requests = await fetchMyRequests();
        renderRequests(document.getElementById('requestsList'), requests);
        
        // Hide loading, show content or empty state
        document.getElementById('loading-requests').style.display = 'none';
        if (requests.length > 0) {
            document.getElementById('requestsList').style.display = 'block';
        } else {
            document.getElementById('empty-requests').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Failed to load requests:', error);
        document.getElementById('loading-requests').style.display = 'none';
        document.getElementById('empty-requests').style.display = 'block';
    }
}

/**
 * Load and render applications received
 */
async function loadApplicationsReceived() {
    try {
        const applications = await fetchApplicationsReceived();
        renderApplications(document.getElementById('applicationsList'), applications);
        
        // Hide loading, show content or empty state
        document.getElementById('loading-applications').style.display = 'none';
        if (applications.length > 0) {
            document.getElementById('applicationsList').style.display = 'block';
        } else {
            document.getElementById('empty-applications').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Failed to load applications:', error);
        document.getElementById('loading-applications').style.display = 'none';
        document.getElementById('empty-applications').style.display = 'block';
    }
}

/**
 * Load and render my conversations
 */
async function loadMyConversations() {
    try {
        const conversations = await fetchMyConversations();
        renderMessages(document.getElementById('messagesList'), conversations);
        
        // Hide loading, show content or empty state
        document.getElementById('loading-messages').style.display = 'none';
        if (conversations.length > 0) {
            document.getElementById('messagesList').style.display = 'block';
        } else {
            document.getElementById('empty-messages').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Failed to load conversations:', error);
        document.getElementById('loading-messages').style.display = 'none';
        document.getElementById('empty-messages').style.display = 'block';
    }
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

/**
 * Render tuition requests list
 * @param {HTMLElement} listEl - The list container element
 * @param {Array} requests - Array of tuition requests
 */
function renderRequests(listEl, requests) {
    listEl.innerHTML = '';
    
    requests.forEach(request => {
        const li = document.createElement('li');
        li.className = 'request-card';
        
        li.innerHTML = `
            <div class="request-header">
                <h4 class="request-title">${request.subject} - ${request.classLevel}</h4>
                <span class="status-badge ${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
            </div>
            
            <div class="request-details">
                <div class="request-detail">
                    <label>Curriculum</label>
                    <span>${request.curriculum}</span>
                </div>
                <div class="request-detail">
                    <label>Location</label>
                    <span>${request.location}</span>
                </div>
                <div class="request-detail">
                    <label>Tuition Type</label>
                    <span>${request.tuitionType}</span>
                </div>
                <div class="request-detail">
                    <label>Schedule</label>
                    <span>${request.daysPerWeek} days/week, ${request.duration}</span>
                </div>
                <div class="request-detail">
                    <label>Salary Range</label>
                    <span>${request.salaryRange}</span>
                </div>
            </div>
            
            <div class="request-actions">
                <button class="btn-secondary" onclick="editRequest(${request.id})" aria-label="Edit request ${request.id}">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn-secondary" onclick="viewApplications(${request.id})" aria-label="View applications for request ${request.id}">
                    <i class="fas fa-eye"></i>
                    View Applications
                </button>
                ${request.status === 'open' ? `
                    <button class="btn-danger" onclick="closeRequest(${request.id})" aria-label="Close request ${request.id}">
                        <i class="fas fa-times"></i>
                        Close
                    </button>
                ` : ''}
            </div>
        `;
        
        listEl.appendChild(li);
    });
}

/**
 * Render applications list
 * @param {HTMLElement} listEl - The list container element
 * @param {Array} applications - Array of applications
 */
function renderApplications(listEl, applications) {
    listEl.innerHTML = '';
    
    applications.forEach(app => {
        const li = document.createElement('li');
        li.className = 'application-card';
        
        li.innerHTML = `
            <div class="application-header">
                <span class="tutor-name">${app.tutorName}</span>
                <span class="status-badge ${app.status}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
            </div>
            
            <p class="application-message">"${app.message}"</p>
            
            <div class="request-details">
                <div class="request-detail">
                    <label>Rating</label>
                    <span>⭐ ${app.tutorRating}/5.0</span>
                </div>
                <div class="request-detail">
                    <label>Experience</label>
                    <span>${app.tutorExperience}</span>
                </div>
                <div class="request-detail">
                    <label>Applied</label>
                    <span>${new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="application-actions">
                <button class="btn-success" onclick="acceptApplication(${app.id})" aria-label="Accept application from ${app.tutorName}">
                    <i class="fas fa-check"></i>
                    Accept
                </button>
                <button class="btn-danger" onclick="rejectApplication(${app.id})" aria-label="Reject application from ${app.tutorName}">
                    <i class="fas fa-times"></i>
                    Reject
                </button>
                <button class="btn-secondary" onclick="messageTutor(${app.id})" aria-label="Message ${app.tutorName}">
                    <i class="fas fa-comment"></i>
                    Message
                </button>
                <button class="btn-secondary report-btn" title="Report this tutor"
                        data-reported-user="${app.tutor_id || ''}"
                        data-content-id="application-${app.id}">
                    <i class="fas fa-flag"></i>
                    Report
                </button>
            </div>
        `;
        
        listEl.appendChild(li);
    });
}

/**
 * Render messages/conversations list
 * @param {HTMLElement} listEl - The list container element
 * @param {Array} conversations - Array of conversations
 */
function renderMessages(listEl, conversations) {
    listEl.innerHTML = '';
    
    conversations.forEach(conv => {
        const li = document.createElement('li');
        li.className = 'message-card';
        li.onclick = () => openConversation(conv.id);
        
        const timeAgo = getTimeAgo(new Date(conv.lastMessageTime));
        
        li.innerHTML = `
            <div class="message-header">
                <span class="message-from">${conv.tutorName}</span>
                <span class="message-time">${timeAgo}</span>
            </div>
            <p class="message-preview">${conv.lastMessage}</p>
        `;
        
        listEl.appendChild(li);
    });
}

// ============================================================================
// BADGE UPDATE FUNCTIONS
// ============================================================================

/**
 * Update all badges based on current data
 */
async function updateAllBadges() {
    try {
        const [requests, applications, conversations] = await Promise.all([
            fetchMyRequests(),
            fetchApplicationsReceived(),
            fetchMyConversations()
        ]);
        
        // Update request badge
        const openRequests = requests.filter(r => r.status === 'open').length;
        document.getElementById('badge-requests').textContent = openRequests;
        
        // Update applications badge
        const pendingApplications = applications.filter(a => a.status === 'pending').length;
        document.getElementById('badge-apps').textContent = pendingApplications;
        
        // Update messages badge (dot if unread)
        const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
        const msgBadge = document.getElementById('badge-msg');
        if (totalUnread > 0) {
            msgBadge.style.display = 'block';
        } else {
            msgBadge.style.display = 'none';
        }
        
        // Update bell badge (total notifications)
        const totalNotifications = openRequests + pendingApplications + totalUnread;
        document.getElementById('badge-bell').textContent = totalNotifications;
        
    } catch (error) {
        console.error('Failed to update badges:', error);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get relative time ago from date
 * @param {Date} date - The date to compare
 * @returns {string} Relative time string
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

// ============================================================================
// ACTION HANDLERS (Placeholders for now)
// ============================================================================

/**
 * Edit tuition request (placeholder)
 * @param {number} requestId - The request ID to edit
 */
function editRequest(requestId) {
    // 🔑 Future: Navigate to edit page
    // window.location.href = `student-request-edit.html?id=${requestId}`;
    alert(`Edit request ${requestId} - Feature coming soon!`);
}

/**
 * View applications for a request (placeholder)
 * @param {number} requestId - The request ID
 */
function viewApplications(requestId) {
    // Navigate to applications page filtered by request
    window.location.href = `applications.html?requestId=${requestId}`;
}

/**
 * Close tuition request (placeholder)
 * @param {number} requestId - The request ID to close
 */
async function closeRequest(requestId) {
    if (!confirm('Are you sure you want to close this request?')) return;
    try {
        const supabase = window.getSupabaseClient?.();
        if (supabase) {
            const { error } = await supabase
                .from('requests')
                .update({ status: 'closed' })
                .eq('id', requestId);
            if (error) throw error;
            alert('Request closed successfully.');
            await loadMyRequests();
            return;
        }
    } catch (e) {
        console.error('Failed to close request in Supabase:', e);
    }
    // Fallback: try update mockRequests
    if (Array.isArray(window.mockRequests)) {
        const idx = window.mockRequests.findIndex(r => Number(r.id) === Number(requestId));
        if (idx >= 0) {
            window.mockRequests[idx].status = 'closed';
        }
    }
    alert('Request closed (offline mode).');
    await loadMyRequests();
}

/**
 * Accept application (placeholder)
 * @param {number} applicationId - The application ID to accept
 */
async function acceptApplication(applicationId) {
    try {
        const appsUtil = window.applications;
        if (!appsUtil?.updateApplicationStatus || !appsUtil?.createMatch) throw new Error('Utilities not available');

        // 1) Set application accepted
        const updated = await appsUtil.updateApplicationStatus(applicationId, 'accepted');

        // 2) Create a match
        const currentUser = window.auth?.getCurrentUser?.();
        const request_id = updated?.request_id;
        const tutor_id = updated?.tutor_id;
        if (request_id && currentUser?.id && tutor_id) {
            await appsUtil.createMatch({ request_id, student_id: currentUser.id, tutor_id, application_id: applicationId });
        }

        // 3) Close the request
        try {
            const supabase = window.getSupabaseClient?.();
            if (supabase && request_id) {
                await supabase.from('requests').update({ status: 'closed' }).eq('id', request_id);
            } else if (Array.isArray(window.mockRequests)) {
                const idx = window.mockRequests.findIndex(r => Number(r.id) === Number(request_id));
                if (idx >= 0) window.mockRequests[idx].status = 'closed';
            }
        } catch (_) {}

        alert('Application accepted. Match created and request closed.');
        await Promise.all([loadApplicationsReceived(), loadMyRequests(), updateAllBadges()]);
    } catch (e) {
        console.error('Failed to accept application:', e);
        alert('Failed to accept application. Please try again.');
    }
}

/**
 * Reject application (placeholder)
 * @param {number} applicationId - The application ID to reject
 */
async function rejectApplication(applicationId) {
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
        const appsUtil = window.applications;
        if (!appsUtil?.updateApplicationStatus) throw new Error('Utilities not available');
        await appsUtil.updateApplicationStatus(applicationId, 'rejected');
        alert('Application rejected.');
        await Promise.all([loadApplicationsReceived(), updateAllBadges()]);
    } catch (e) {
        console.error('Failed to reject application:', e);
        alert('Failed to reject application. Please try again.');
    }
}

/**
 * Message tutor (placeholder)
 * @param {number} applicationId - The application ID
 */
function messageTutor(applicationId) {
    // 🔑 Future: Open conversation or navigate to messages
    alert(`Message tutor for application ${applicationId} - Feature coming soon!`);
}

/**
 * Open conversation (placeholder)
 * @param {number} conversationId - The conversation ID
 */
function openConversation(conversationId) {
    // Navigate to messages page with conversation
    window.location.href = `messages.html?conversationId=${conversationId}`;
}

// ============================================================================
// NOTIFICATION BELL HANDLER
// ============================================================================

/**
 * Handle notification bell click
 */
document.getElementById('notification-bell').addEventListener('click', function() {
    // 🔑 Future: Show notification dropdown or navigate to notifications page
    alert('Notifications feature coming soon!');
});

// Update dashboard header with user information
function updateDashboardHeader(user) {
    const headerTitle = document.querySelector('.topbar h1');
    if (headerTitle) {
        headerTitle.innerHTML = `<i class="fas fa-tachometer-alt"></i> Welcome, ${user.email.split('@')[0]}`;
    }
}
