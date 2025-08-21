// Applications Script with Supabase Integration
// Handles tutor applications management with real-time data

// Mock data fallback
const fallbackApplications = [
    {
        id: 1,
        request_id: 101,
        status: 'pending',
        proposed_salary: 8000,
        message: 'I have 5 years of experience teaching Mathematics. I can start immediately.',
        created_at: '2024-01-15T10:00:00Z',
        tuition_request: {
            subject: 'Mathematics',
            class_level: 'Grade 10',
            location: 'Dhaka',
            salary_range: '৳7000-9000'
        }
    },
    {
        id: 2,
        request_id: 102,
        status: 'accepted',
        proposed_salary: 7500,
        message: 'Experienced Physics tutor with flexible schedule.',
        created_at: '2024-01-14T14:30:00Z',
        tuition_request: {
            subject: 'Physics',
            class_level: 'Grade 11',
            location: 'Dhaka',
            salary_range: '৳7000-8000'
        }
    }
];

// Initialize applications page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load applications data
        await loadApplications();
        
        // Initialize filters
        initializeFilters();
        
        // Initialize notification bell
        initNotificationBell();
        
    } catch (error) {
        console.error('Error initializing applications page:', error);
        // Fallback to mock data
        renderApplications(fallbackApplications);
    }
});

// Generic: fetch applications with optional filters and embedded request details
async function fetchApplications(filters = {}) {
    // Try Supabase first
    try {
        const supabase = window.getSupabaseClient?.();
        if (supabase) {
            let query = supabase
                .from('applications')
                .select(`
                    *,
                    requests:requests!inner(
                        id,
                        subject,
                        class,
                        class_level,
                        location,
                        salary_range,
                        curriculum,
                        tuition_type,
                        session_duration,
                        days_per_week,
                        additional_details,
                        student_id
                    )
                `)
                .order('created_at', { ascending: false });

            if (filters.tutor_id) query = query.eq('tutor_id', filters.tutor_id);
            if (filters.student_id) query = query.eq('requests.student_id', filters.student_id);
            if (filters.request_id) query = query.eq('request_id', filters.request_id);

            const { data, error } = await query;
            if (error) throw error;

            // Normalize to previous shape used in render (tuition_request)
            const normalized = (data || []).map(a => ({
                ...a,
                tuition_request: a.tuition_request || a.requests || null
            }));
            return normalized;
        }
    } catch (e) {
        console.warn('fetchApplications failed, using fallback:', e);
    }
    // Fallback to mock
    const mocked = Array.isArray(window.mockApplications) ? window.mockApplications : fallbackApplications;
    // Filter locally if filters provided
    return mocked.filter(a => {
        const byTutor = !filters.tutor_id || a.tutor_id === filters.tutor_id;
        const byReq = !filters.request_id || a.request_id === filters.request_id;
        // No student_id in mock apps; allow all
        return byTutor && byReq;
    });
}

// Update application status (accept/reject/denied/pending)
async function updateApplicationStatus(applicationId, status) {
    try {
        const supabase = window.getSupabaseClient?.();
        if (supabase) {
            const { data, error } = await supabase
                .from('applications')
                .update({ status })
                .eq('id', applicationId)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    } catch (e) {
        console.warn('updateApplicationStatus fallback:', e);
    }
    // Fallback
    if (Array.isArray(window.mockApplications)) {
        const idx = window.mockApplications.findIndex(a => Number(a.id) === Number(applicationId));
        if (idx >= 0) window.mockApplications[idx].status = status;
        return window.mockApplications[idx];
    }
    return null;
}

// Create a match record when student accepts a tutor
async function createMatch({ request_id, student_id, tutor_id, application_id }) {
    try {
        const supabase = window.getSupabaseClient?.();
        if (supabase) {
            const payload = {
                request_id,
                student_id,
                tutor_id,
                application_id,
                created_at: new Date().toISOString()
            };
            const { data, error } = await supabase
                .from('matches')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    } catch (e) {
        console.warn('createMatch fallback:', e);
    }
    // Fallback
    window.mockMatches = Array.isArray(window.mockMatches) ? window.mockMatches : [];
    const match = {
        id: Date.now(),
        request_id,
        student_id,
        tutor_id,
        application_id,
        created_at: new Date().toISOString()
    };
    window.mockMatches.push(match);
    return match;
}

// Fetch matches with optional filters
async function fetchMatches(filters = {}) {
    try {
        const supabase = window.getSupabaseClient?.();
        if (supabase) {
            let query = supabase.from('matches').select('*').order('created_at', { ascending: false });
            if (filters.tutor_id) query = query.eq('tutor_id', filters.tutor_id);
            if (filters.student_id) query = query.eq('student_id', filters.student_id);
            if (filters.request_id) query = query.eq('request_id', filters.request_id);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    } catch (e) {
        console.warn('fetchMatches fallback:', e);
    }
    // Fallback
    const mocked = Array.isArray(window.mockMatches) ? window.mockMatches : [];
    return mocked.filter(m => {
        const byTutor = !filters.tutor_id || m.tutor_id === filters.tutor_id;
        const byStudent = !filters.student_id || m.student_id === filters.student_id;
        const byReq = !filters.request_id || m.request_id === filters.request_id;
        return byTutor && byStudent && byReq;
    });
}

// Load applications from Supabase (or fallback) and render
async function loadApplications() {
    try {
        const currentUser = window.auth?.getCurrentUser?.();
        if (!currentUser) throw new Error('User not authenticated');
        const apps = await fetchApplications({ tutor_id: currentUser.id });
        console.log('✅ Applications loaded:', apps);
        renderApplications(apps || []);
    } catch (error) {
        console.error('Error loading applications:', error);
        renderApplications(fallbackApplications);
    }
}

// Render applications list
function renderApplications(applications) {
    const container = document.getElementById('applications-list');
    if (!container) return;

    if (!applications || applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <h4>No Applications Yet</h4>
                <p>Your applications to tuition requests will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = applications.map(app => createApplicationCard(app)).join('');
}

// Create application card HTML
function createApplicationCard(app) {
    const statusClass = getStatusClass(app.status);
    const statusText = getStatusText(app.status);
    const request = app.tuition_request || {};
    
    return `
        <div class="application-card ${statusClass}">
            <div class="application-header">
                <h4>${request.subject} - ${request.class_level}</h4>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="application-details">
                <p><strong>Location:</strong> ${request.location}</p>
                <p><strong>Salary Range:</strong> ${request.salary_range}</p>
                <p><strong>Curriculum:</strong> ${request.curriculum || 'Not specified'}</p>
                <p><strong>Type:</strong> ${request.tuition_type || 'Not specified'}</p>
                <p><strong>Duration:</strong> ${request.session_duration || 'Not specified'} hours</p>
                <p><strong>Days:</strong> ${request.days_per_week || 'Not specified'} days/week</p>
            </div>
            
            ${request.additional_details ? `
                <div class="request-details">
                    <p><strong>Additional Details:</strong></p>
                    <p>${request.additional_details}</p>
                </div>
            ` : ''}
            
            <div class="application-message">
                <p><strong>Your Message:</strong></p>
                <p>${app.message || 'No message provided'}</p>
            </div>
            
            <div class="application-footer">
                <span class="proposed-salary">Proposed: ৳${app.proposed_salary || 'Not specified'}</span>
                <span class="application-date">Applied: ${formatDate(app.created_at)}</span>
            </div>
            
            ${app.status === 'pending' ? `
                <div class="application-actions">
                    <button class="btn-action btn-edit" onclick="editApplication(${app.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-withdraw" onclick="withdrawApplication(${app.id})">
                        <i class="fas fa-times"></i> Withdraw
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// Get status CSS class
function getStatusClass(status) {
    switch (status) {
        case 'accepted': return 'status-accepted';
        case 'rejected': return 'status-rejected';
        case 'pending': return 'status-pending';
        default: return 'status-unknown';
    }
}

// Get status display text
function getStatusText(status) {
    switch (status) {
        case 'accepted': return 'Accepted';
        case 'rejected': return 'Rejected';
        case 'pending': return 'Pending';
        default: return 'Unknown';
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

// Initialize filters
function initializeFilters() {
    const statusFilter = document.getElementById('status-filter');
    const subjectFilter = document.getElementById('subject-filter');
    const locationFilter = document.getElementById('location-filter');

    if (statusFilter) {
        statusFilter.addEventListener('change', filterApplications);
    }
    if (subjectFilter) {
        subjectFilter.addEventListener('change', filterApplications);
    }
    if (locationFilter) {
        locationFilter.addEventListener('change', filterApplications);
    }
}

// Filter applications based on selected criteria
function filterApplications() {
    // This would filter the currently loaded applications
    // For now, just reload all applications
    loadApplications();
}

// Edit application
async function editApplication(applicationId) {
    try {
        const supabase = window.getSupabaseClient();
        if (!supabase) {
            alert('Cannot edit application - backend not available');
            return;
        }

        // Get new message from user
        const newMessage = prompt('Enter your updated message:');
        if (!newMessage) return;

        // Update application in Supabase
        const { error } = await supabase
            .from('applications')
            .update({ message: newMessage })
            .eq('id', applicationId);

        if (error) throw error;

        alert('Application updated successfully!');
        // Reload applications
        await loadApplications();

    } catch (error) {
        console.error('Error updating application:', error);
        alert('Failed to update application. Please try again.');
    }
}

// Withdraw application
async function withdrawApplication(applicationId) {
    try {
        if (!confirm('Are you sure you want to withdraw this application?')) {
            return;
        }

        const supabase = window.getSupabaseClient();
        if (!supabase) {
            alert('Cannot withdraw application - backend not available');
            return;
        }

        // Delete application from Supabase
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', applicationId);

        if (error) throw error;

        alert('Application withdrawn successfully!');
        // Reload applications
        await loadApplications();

    } catch (error) {
        console.error('Error withdrawing application:', error);
        alert('Failed to withdraw application. Please try again.');
    }
}

// Initialize notification bell
function initNotificationBell() {
    const notificationBell = document.getElementById('notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
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
    return Math.floor(Math.random() * 5) + 1;
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
    alert(`You have ${count} new notifications!\n\n• ${Math.floor(count/2)} application updates\n• ${Math.floor(count/3)} new tuition requests\n• ${Math.floor(count/4)} messages`);
}

// Export functions for use in other scripts
window.applications = {
    loadApplications,
    renderApplications,
    editApplication,
    withdrawApplication,
    // utilities
    fetchApplications,
    fetchMatches,
    updateApplicationStatus,
    createMatch
};
