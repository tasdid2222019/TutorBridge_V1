// Tuition Requests Page JavaScript
// This file handles the tuition requests page functionality with sample data
// Ready for Supabase integration later

// Placeholder for current user ID - will be replaced with Supabase auth
const currentUserId = 123;

// Sample tuition requests data - will be replaced with Supabase queries
const sampleTuitionRequests = [
    {
        id: 1,
        subject: "Physics",
        classLevel: "Grade 11",
        location: "Dhaka",
        type: "Online",
        details: "Need help with exam preparation. Student is struggling with mechanics and thermodynamics.",
        budget: "৳800/hour",
        student: "Parent of Grade 11 student",
        postedDate: "2024-01-20",
        schedule: "Weekends, 2-3 hours",
        requirements: "Experienced physics tutor, preferably with engineering background"
    },
    {
        id: 2,
        subject: "Chemistry",
        classLevel: "Grade 9",
        location: "Kohaino",
        type: "In-person",
        details: "Weekly sessions required. Focus on organic chemistry and lab safety.",
        budget: "৳600/hour",
        student: "Parent of Grade 9 student",
        postedDate: "2024-01-18",
        schedule: "Weekdays, 1 hour",
        requirements: "Chemistry graduate, patient with beginners"
    },
    {
        id: 3,
        subject: "Biology",
        classLevel: "Grade 12",
        location: "Chittagong",
        type: "Online",
        details: "Focus on genetics and evolution. Preparing for university entrance exams.",
        budget: "৳1000/hour",
        student: "Parent of Grade 12 student",
        postedDate: "2024-01-19",
        schedule: "Weekends, 3-4 hours",
        requirements: "Biology expert, experience with exam preparation"
    },
    {
        id: 4,
        subject: "Mathematics",
        classLevel: "Grade 7",
        location: "Dhaka",
        type: "In-person",
        details: "Basic math concepts and problem solving. Student needs confidence building.",
        budget: "৳500/hour",
        student: "Parent of Grade 7 student",
        postedDate: "2024-01-17",
        schedule: "Weekdays, 1 hour",
        requirements: "Patient math tutor, experience with middle school students"
    },
    {
        id: 5,
        subject: "English Literature",
        classLevel: "Grade 10",
        location: "Sylhet",
        type: "Online",
        details: "Essay writing and literature analysis. Improving writing skills.",
        budget: "৳700/hour",
        student: "Parent of Grade 10 student",
        postedDate: "2024-01-16",
        schedule: "Weekends, 2 hours",
        requirements: "English literature graduate, strong writing skills"
    },
    {
        id: 6,
        subject: "Bangla",
        classLevel: "Grade 5",
        location: "Dhaka",
        type: "In-person",
        details: "Reading comprehension and grammar. Building strong foundation.",
        budget: "৳400/hour",
        student: "Parent of Grade 5 student",
        postedDate: "2024-01-15",
        schedule: "Weekdays, 1 hour",
        requirements: "Bangla teacher, experience with primary students"
    },
    {
        id: 7,
        subject: "History",
        classLevel: "Grade 8",
        location: "Rajshahi",
        type: "Hybrid",
        details: "Bangladesh history and world history. Making history interesting.",
        budget: "৳550/hour",
        student: "Parent of Grade 8 student",
        postedDate: "2024-01-14",
        schedule: "Weekends, 1.5 hours",
        requirements: "History enthusiast, good storytelling skills"
    },
    {
        id: 8,
        subject: "Geography",
        classLevel: "Grade 6",
        location: "Khulna",
        type: "Online",
        details: "Physical geography and map reading. Interactive learning preferred.",
        budget: "৳450/hour",
        student: "Parent of Grade 6 student",
        postedDate: "2024-01-13",
        schedule: "Weekdays, 1 hour",
        requirements: "Geography teacher, creative teaching methods"
    }
];

// Filtered requests
let filteredRequests = [...sampleTuitionRequests];

// Badge update function
function updateBadges() {
    const requestsBadge = document.getElementById('badge-requests');
    if (requestsBadge) {
        requestsBadge.textContent = sampleTuitionRequests.length;
    }

    // Update other badges (placeholder values for now)
    const appsBadge = document.getElementById('badge-apps');
    if (appsBadge) {
        appsBadge.textContent = '2';
    }

    const msgBadge = document.getElementById('badge-msg');
    if (msgBadge) {
        const unreadCount = 3; // This will come from Supabase later
        msgBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    const bellBadge = document.getElementById('badge-bell');
    if (bellBadge) {
        const totalNotifications = 2 + sampleTuitionRequests.length + 3; // +2 for apps, +3 for messages
        bellBadge.textContent = totalNotifications;
        bellBadge.style.display = totalNotifications > 0 ? 'flex' : 'none';
    }
}

// Render tuition requests function
function renderRequests(requests = filteredRequests) {
    const container = document.getElementById('requests-list');
    if (!container) return;

    if (requests.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #b8c1ec;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No tuition requests found matching your criteria.</p>
                <p>Try adjusting your filters or check back later.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    // Exclude requests denied by this tutor (mock store)
    const denied = (window.deniedRequests || []).filter(d => d.tutor_id === currentUserId).map(d => Number(d.request_id));

    requests.filter(req => !denied.includes(req.id)).forEach(req => {
        const requestCard = document.createElement('div');
        requestCard.className = 'dashboard-section';
        requestCard.style.marginBottom = '1rem';
        
        requestCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <h4 style="color: #5ce1e6; margin: 0 0 0.5rem 0;">${req.subject} - ${req.classLevel}</h4>
                    <p style="margin: 0.2rem 0; color: #b8c1ec;">
                        <strong>Location:</strong> ${req.location}<br>
                        <strong>Type:</strong> ${req.type}<br>
                        <strong>Budget:</strong> ${req.budget}<br>
                        <strong>Schedule:</strong> ${req.schedule}<br>
                        <strong>Posted:</strong> ${new Date(req.postedDate).toLocaleDateString()}<br>
                        <strong>Student:</strong> ${req.student}<br>
                        <strong>Requirements:</strong> ${req.requirements}
                    </p>
                    <div style="margin-top: 0.8rem; padding: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 6px;">
                        <strong style="color: #5ce1e6;">Details:</strong><br>
                        <span style="color: #b8c1ec;">${req.details}</span>
                    </div>
                </div>
            </div>
            <div class="actions">
                <button onclick="applyToRequest(${req.id})">
                    <i class="fas fa-paper-plane"></i> Apply Now
                </button>
                <button onclick="viewRequest(${req.id})" class="secondary">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button onclick="denyRequest(${req.id}, ${currentUserId})" class="secondary" style="background: rgba(255, 59, 48, 0.15); color: #ff3b30; border-color: rgba(255,59,48,0.35);">
                    <i class="fas fa-ban"></i> Deny
                </button>
                <button onclick="messageParent('${req.student}')" class="secondary">
                    <i class="fas fa-comment"></i> Message
                </button>
                <button class="report-btn" 
                        data-reported-user="${req.student}" 
                        data-content-id="${req.id}" 
                        title="Report this request">
                    <i class="fas fa-flag"></i> Report
                </button>
            </div>
        `;
        
        container.appendChild(requestCard);
    });
}

// Filter requests function
function filterRequests() {
    const subjectFilter = document.getElementById('subject-filter').value;
    const classFilter = document.getElementById('class-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const budgetFilter = document.getElementById('budget-filter').value;

    filteredRequests = sampleTuitionRequests.filter(req => {
        const subjectMatch = !subjectFilter || req.subject === subjectFilter;
        const classMatch = !classFilter || req.classLevel === classFilter;
        const locationMatch = !locationFilter || req.location === locationFilter;
        const typeMatch = !typeFilter || req.type === typeFilter;
        
        let budgetMatch = true;
        if (budgetFilter) {
            const budget = parseInt(req.budget.replace(/[^\d]/g, ''));
            switch (budgetFilter) {
                case '0-500':
                    budgetMatch = budget <= 500;
                    break;
                case '500-800':
                    budgetMatch = budget > 500 && budget <= 800;
                    break;
                case '800-1000':
                    budgetMatch = budget > 800 && budget <= 1000;
                    break;
                case '1000+':
                    budgetMatch = budget > 1000;
                    break;
            }
        }
        
        return subjectMatch && classMatch && locationMatch && typeMatch && budgetMatch;
    });

    renderRequests();
}

// Action functions
function applyToRequest(requestId) {
    if (confirm('Are you sure you want to apply to this tuition request?')) {
        console.log(`Applying to request ${requestId}`);
        // TODO: Will create application in Supabase
        // const { data, error } = await supabase
        //     .from("applications")
        //     .insert({
        //         tuition_request_id: requestId,
        //         tutor_id: currentUserId,
        //         status: "pending",
        //         applied_date: new Date().toISOString()
        //     });
        
        // Show success message
        alert('Application submitted successfully!');
        
        // Refresh the requests list
        // await loadTuitionRequestsFromSupabase();
        // renderRequests();
    }
}

function viewRequest(requestId) {
    console.log(`Viewing request ${requestId}`);
    // TODO: Will show request details in modal or navigate to detail page
    // const { data, error } = await supabase
    //     .from("tuition_requests")
    //     .select("*")
    //     .eq("id", requestId)
    //     .single();
}

function denyRequest(requestId, tutorId) {
    if (!confirm('Are you sure you want to deny this request?')) return;
    if (!window.deniedRequests) window.deniedRequests = [];
    // Prevent duplicates
    const exists = window.deniedRequests.some(d => d.tutor_id === tutorId && Number(d.request_id) === Number(requestId));
    if (!exists) {
        window.deniedRequests.push({
            tutor_id: tutorId,
            request_id: requestId,
            status: 'denied',
            created_at: new Date().toISOString()
        });
    }
    // Re-render to hide the denied request
    renderRequests();

    // Supabase-ready placeholder:
    // const supabase = window.initSupabase?.();
    // const { data, error } = await supabase.from('denied_requests').insert([
    //   { tutor_id: tutorId, request_id: requestId, status: 'denied', created_at: new Date().toISOString() }
    // ]);
    // if (error) console.error('Failed to record denial:', error);
}

function messageParent(studentInfo) {
    console.log(`Messaging parent: ${studentInfo}`);
    // TODO: Will navigate to messages page or open chat
    // window.location.href = `messages.html?parent=${encodeURIComponent(studentInfo)}`;
}

// Supabase integration placeholders
async function loadTuitionRequestsFromSupabase() {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //     .from("tuition_requests")
    //     .select(`
    //         *,
    //         students (
    //             name,
    //             parent_name,
    //             contact_info
    //         )
    //     `)
    //     .eq("status", "open")
    //     .order("created_at", { ascending: false });
    
    // if (error) {
    //     console.error("Error loading tuition requests:", error);
    //     return [];
    // }
    
    // return data;
    return sampleTuitionRequests;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tuition Requests page initialized');
    
    // Update badges
    updateBadges();
    
    // Render initial requests
    renderRequests();
    
    // Add filter event listeners
    const subjectFilter = document.getElementById('subject-filter');
    const classFilter = document.getElementById('class-filter');
    const locationFilter = document.getElementById('location-filter');
    const typeFilter = document.getElementById('type-filter');
    const budgetFilter = document.getElementById('budget-filter');
    
    if (subjectFilter) subjectFilter.addEventListener('change', filterRequests);
    if (classFilter) classFilter.addEventListener('change', filterRequests);
    if (locationFilter) locationFilter.addEventListener('change', filterRequests);
    if (typeFilter) typeFilter.addEventListener('change', filterRequests);
    if (budgetFilter) budgetFilter.addEventListener('change', filterRequests);
    
    // Add notification bell event listener
    const notificationBell = document.getElementById('notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            console.log('Notification bell clicked');
            // Will show notification panel or navigate to notifications page
        });
    }
});

// Export functions for potential use in other modules
window.tuitionRequestsPage = {
    renderRequests,
    filterRequests,
    loadTuitionRequestsFromSupabase,
    updateBadges
};
