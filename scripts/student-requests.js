// Student Requests Script with Supabase Integration
// Handles student tuition requests management with real-time data

// Mock data fallback
const fallbackRequests = [
    {
        id: 1,
        subject: 'Mathematics',
        class_level: 'Grade 10',
        location: 'Dhaka',
        curriculum: 'English Medium',
        tuition_type: 'home',
        session_duration: 1.5,
        days_per_week: 3,
        salary_range: '৳7000-9000',
        status: 'open',
        created_at: '2024-01-15T10:00:00Z',
        applications_count: 2
    },
    {
        id: 2,
        subject: 'Physics',
        class_level: 'Grade 11',
        location: 'Dhaka',
        curriculum: 'English Version',
        tuition_type: 'online',
        session_duration: 2.0,
        days_per_week: 2,
        salary_range: '৳8000-10000',
        status: 'closed',
        created_at: '2024-01-10T14:30:00Z',
        applications_count: 3
    }
];

// Initialize student requests page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load requests data
        await loadMyRequests();
        
        // Initialize filters
        initializeFilters();
        
        // Initialize notification bell
        initNotificationBell();
        
    } catch (error) {
        console.error('Error initializing student requests page:', error);
        // Fallback to mock data
        renderMyRequests(fallbackRequests);
    }
});

// Load student requests from Supabase
async function loadMyRequests() {
    try {
        const supabase = window.getSupabaseClient();
        if (supabase) {
            const currentUser = window.auth?.getCurrentUser();
            if (!currentUser) {
                console.warn('User not authenticated');
                return;
            }

            // 🔑 Supabase Query: Get student's tuition requests
            const { data, error } = await supabase
                .from('tuition_requests')
                .select(`
                    *,
                    applications (count)
                `)
                .eq('student_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to include applications count
            const requestsWithCounts = data.map(request => ({
                ...request,
                applications_count: request.applications?.length || 0
            }));

            console.log('✅ Student requests loaded from Supabase:', requestsWithCounts);
            renderMyRequests(requestsWithCounts);

        } else {
            // Fallback to mock data
            console.log('🔧 Supabase not available, using mock data');
            renderMyRequests(fallbackRequests);
        }

    } catch (error) {
        console.error('Error loading student requests:', error);
        // Fallback to mock data
        renderMyRequests(fallbackRequests);
    }
}

// Render student requests list
function renderMyRequests(requests) {
    const container = document.getElementById('myRequests');
    const loadingElement = document.getElementById('loading-myRequests');
    const emptyElement = document.getElementById('empty-myRequests');
    
    if (!container) return;

    // Hide loading
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }

    if (!requests || requests.length === 0) {
        // Show empty state
        if (emptyElement) {
            emptyElement.style.display = 'block';
        }
        if (container) {
            container.style.display = 'none';
        }
        return;
    }

    // Hide empty state and show requests
    if (emptyElement) {
        emptyElement.style.display = 'none';
    }
    if (container) {
        container.style.display = 'block';
    }

    // Render requests
    container.innerHTML = requests.map(request => createRequestCard(request)).join('');
}

// Create request card HTML
function createRequestCard(request) {
    const statusClass = getStatusClass(request.status);
    const statusText = getStatusText(request.status);
    const curriculumText = request.curriculum || 'Not specified';
    const typeText = request.tuition_type === 'home' ? 'Home Tuition' : 'Online';
    
    return `
        <li class="request-item ${statusClass}">
            <div class="request-header">
                <h4>${request.subject} - ${request.class_level}</h4>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="request-details">
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${request.location}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Curriculum:</span>
                    <span class="detail-value">${curriculumText}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${typeText}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${request.session_duration} hours</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Days:</span>
                    <span class="detail-value">${request.days_per_week} days/week</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Salary Range:</span>
                    <span class="detail-value">${request.salary_range}</span>
                </div>
            </div>
            
            ${request.additional_details ? `
                <div class="request-notes">
                    <span class="detail-label">Additional Details:</span>
                    <p>${request.additional_details}</p>
                </div>
            ` : ''}
            
            <div class="request-footer">
                <div class="applications-info">
                    <i class="fas fa-users"></i>
                    <span>${request.applications_count} application${request.applications_count !== 1 ? 's' : ''}</span>
                </div>
                <div class="request-date">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(request.created_at)}</span>
                </div>
            </div>
            
            <div class="request-actions">
                <button class="btn-action btn-view" onclick="viewApplications(${request.id})">
                    <i class="fas fa-eye"></i> View Applications
                </button>
                ${request.status === 'open' ? `
                    <button class="btn-action btn-edit" onclick="editRequest(${request.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-close" onclick="closeRequest(${request.id})">
                        <i class="fas fa-lock"></i> Close
                    </button>
                ` : ''}
                <button class="btn-action btn-delete" onclick="deleteRequest(${request.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </li>
    `;
}

// Get status CSS class
function getStatusClass(status) {
    switch (status) {
        case 'open': return 'status-open';
        case 'closed': return 'status-closed';
        case 'assigned': return 'status-assigned';
        default: return 'status-unknown';
    }
}

// Get status display text
function getStatusText(status) {
    switch (status) {
        case 'open': return 'Open';
        case 'closed': return 'Closed';
        case 'assigned': return 'Assigned';
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
    const statusFilter = document.getElementById('statusFilter');
    const subjectFilter = document.getElementById('subjectFilter');
    const locationFilter = document.getElementById('locationFilter');

    if (statusFilter) {
        statusFilter.addEventListener('change', filterRequests);
    }
    if (subjectFilter) {
        subjectFilter.addEventListener('change', filterRequests);
    }
    if (locationFilter) {
        locationFilter.addEventListener('change', filterRequests);
    }
}

// Filter requests based on selected criteria
function filterRequests() {
    // This would filter the currently loaded requests
    // For now, just reload all requests
    loadMyRequests();
}

// View applications for a request
function viewApplications(requestId) {
    // Navigate to applications page with request filter
    window.location.href = `applications.html?request=${requestId}`;
}

// Edit request
async function editRequest(requestId) {
    try {
        const supabase = window.getSupabaseClient();
        if (!supabase) {
            alert('Cannot edit request - backend not available');
            return;
        }

        // Navigate to edit form
        window.location.href = `tuition-request-form.html?edit=${requestId}`;

    } catch (error) {
        console.error('Error editing request:', error);
        alert('Failed to edit request. Please try again.');
    }
}

// Close request
async function closeRequest(requestId) {
    try {
        if (!confirm('Are you sure you want to close this request? This will prevent new applications.')) {
            return;
        }

        const supabase = window.getSupabaseClient();
        if (!supabase) {
            alert('Cannot close request - backend not available');
            return;
        }

        // Update request status in Supabase
        const { error } = await supabase
            .from('tuition_requests')
            .update({ status: 'closed' })
            .eq('id', requestId);

        if (error) throw error;

        alert('Request closed successfully!');
        // Reload requests
        await loadMyRequests();

    } catch (error) {
        console.error('Error closing request:', error);
        alert('Failed to close request. Please try again.');
    }
}

// Delete request
async function deleteRequest(requestId) {
    try {
        if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
            return;
        }

        const supabase = window.getSupabaseClient();
        if (!supabase) {
            alert('Cannot delete request - backend not available');
            return;
        }

        // Delete request from Supabase
        const { error } = await supabase
            .from('tuition_requests')
            .delete()
            .eq('id', requestId);

        if (error) throw error;

        alert('Request deleted successfully!');
        // Reload requests
        await loadMyRequests();

    } catch (error) {
        console.error('Error deleting request:', error);
        alert('Failed to delete request. Please try again.');
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
    return Math.floor(Math.random() * 3) + 1;
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
    alert(`You have ${count} new notifications!\n\n• ${Math.floor(count/2)} new applications\n• ${Math.floor(count/3)} application updates\n• ${Math.floor(count/4)} messages`);
}

// Export functions for use in other scripts
window.studentRequests = {
    loadMyRequests,
    renderMyRequests,
    editRequest,
    closeRequest,
    deleteRequest,
    viewApplications
};
