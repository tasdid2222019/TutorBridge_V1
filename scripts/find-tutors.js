// Find Tutors Script with Supabase Integration
// Handles tutor search and filtering with real-time data

// Mock data fallback (will be replaced by backend API calls)
const fallbackTutors = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        subject: "Mathematics & Physics",
        location: "New York, NY",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 2,
        name: "Prof. Michael Chen",
        subject: "Computer Science",
        location: "San Francisco, CA",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 3,
        name: "Dr. Emily Rodriguez",
        subject: "English Literature",
        location: "Los Angeles, CA",
        rating: 4,
        image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 4,
        name: "Prof. David Thompson",
        subject: "Chemistry & Biology",
        location: "Chicago, IL",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 5,
        name: "Dr. Lisa Wang",
        subject: "Economics & Statistics",
        location: "Boston, MA",
        rating: 4,
        image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 6,
        name: "Prof. James Wilson",
        subject: "History & Political Science",
        location: "Washington, DC",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    }
];

// DOM elements
const searchForm = document.getElementById('search-form');
const loadingElement = document.getElementById('loading');
const tutorResultsElement = document.getElementById('tutor-results');

// Current search state
let currentTutors = [];
let currentFilters = {};

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading initially
    showLoading();
    
    try {
        // Load tutors from Supabase
        await loadTutorsFromSupabase();
        
        // Add search form event listener
        searchForm.addEventListener('submit', handleSearch);
        
        // Load URL parameters for pre-filled search
        loadSearchFromURL();
        
    } catch (error) {
        console.error('Error initializing page:', error);
        // Fallback to mock data
        hideLoading();
        currentTutors = fallbackTutors;
        renderTutors(currentTutors);
    }
});

// Show loading state
function showLoading() {
    loadingElement.style.display = 'flex';
    tutorResultsElement.innerHTML = '';
}

// Hide loading state
function hideLoading() {
    loadingElement.style.display = 'none';
}

// Load tutors from Supabase
async function loadTutorsFromSupabase() {
    try {
        const supabase = window.initSupabase?.();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        // 🔑 Supabase Query: Get all active tutors
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                subjects,
                location,
                rating,
                profile_image_url,
                hourly_rate,
                experience,
                qualification,
                availability
            `)
            .eq('role', 'tutor')
            .eq('status', 'active')
            .order('rating', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        currentTutors = data.map(tutor => ({
            id: tutor.id,
            name: tutor.full_name,
            subject: Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects,
            location: tutor.location,
            rating: tutor.rating || 4.0,
            image_url: tutor.profile_image_url,
            hourly_rate: tutor.hourly_rate,
            experience: tutor.experience,
            qualification: tutor.qualification,
            availability: tutor.availability
        }));

        hideLoading();
        renderTutors(currentTutors);

    } catch (error) {
        console.error('Error loading tutors from Supabase:', error);
        throw error;
    }
}

// Render tutors in the results container
function renderTutors(tutors) {
    if (!tutors || tutors.length === 0) {
        showEmptyState();
        return;
    }
    
    const tutorsHTML = tutors.map(tutor => createTutorCard(tutor)).join('');
    tutorResultsElement.innerHTML = tutorsHTML;
}

// Create individual tutor card HTML
function createTutorCard(tutor) {
    const stars = '★'.repeat(Math.floor(tutor.rating)) + '☆'.repeat(5 - Math.floor(tutor.rating));
    
    return `
        <div class="tutor-card">
            <img src="${tutor.image_url}" alt="${tutor.name}" class="tutor-image" 
                 onerror="this.src='https://via.placeholder.com/150x150/5ce1e6/232946?text=${tutor.name.charAt(0)}'">
            <h3 class="tutor-name">${tutor.name}</h3>
            <p class="tutor-subject">${tutor.subject}</p>
            <p class="tutor-location">📍 ${tutor.location}</p>
            <div class="tutor-rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">${tutor.rating}/5</span>
            </div>
            ${tutor.hourly_rate ? `<p class="tutor-rate">৳${tutor.hourly_rate}/hr</p>` : ''}
            <button class="view-profile-btn" onclick="viewTutorProfile(${tutor.id})">
                View Profile
            </button>
        </div>
    `;
}

// Show empty state when no tutors found
function showEmptyState() {
    tutorResultsElement.innerHTML = `
        <div class="empty-state">
            <h3>No Tutors Found</h3>
            <p>We couldn't find any tutors matching your criteria. Try adjusting your search filters or check back later.</p>
            <button onclick="clearFilters()" class="clear-filters-btn">Clear Filters</button>
        </div>
    `;
}

// Filter tutors based on search criteria
function filterTutors(tutors, filters) {
    return tutors.filter(tutor => {
        // Subject filter
        if (filters.subject && !tutor.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
            return false;
        }
        
        // Location filter
        if (filters.location && !tutor.location.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
        }
        
        // Rating filter
        if (filters.rating && tutor.rating < parseInt(filters.rating)) {
            return false;
        }
        
        return true;
    });
}

// Handle search form submission
async function handleSearch(event) {
    event.preventDefault();
    
    // Show loading
    showLoading();
    
    try {
        // Get form data
        const formData = new FormData(searchForm);
        currentFilters = {
            subject: formData.get('subject') || document.getElementById('subject').value,
            location: formData.get('location') || document.getElementById('location').value,
            rating: formData.get('rating') || document.getElementById('rating').value
        };
        
        // Update URL with search parameters
        updateURLWithSearch(currentFilters);
        
        // Filter tutors based on search criteria
        const filteredTutors = filterTutors(currentTutors, currentFilters);
        
        // Hide loading and show results
        hideLoading();
        renderTutors(filteredTutors);
        
    } catch (error) {
        console.error('Search error:', error);
        hideLoading();
        showEmptyState();
    }
}

// Load search parameters from URL
function loadSearchFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const location = urlParams.get('location');
    const rating = urlParams.get('rating');
    
    if (subject || location || rating) {
        // Pre-fill form fields
        if (subject) document.getElementById('subject').value = subject;
        if (location) document.getElementById('location').value = location;
        if (rating) document.getElementById('rating').value = rating;
        
        // Apply filters
        currentFilters = { subject, location, rating };
        const filteredTutors = filterTutors(currentTutors, currentFilters);
        renderTutors(filteredTutors);
    }
}

// Update URL with search parameters
function updateURLWithSearch(filters) {
    const params = new URLSearchParams();
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.location) params.append('location', filters.location);
    if (filters.rating) params.append('rating', filters.rating);
    
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
}

// Clear all filters
function clearFilters() {
    // Clear form fields
    document.getElementById('subject').value = '';
    document.getElementById('location').value = '';
    document.getElementById('rating').value = '';
    
    // Clear filters and show all tutors
    currentFilters = {};
    renderTutors(currentTutors);
    
    // Update URL
    window.history.pushState({}, '', window.location.pathname);
}

// Navigate to tutor profile page
function viewTutorProfile(tutorId) {
    window.location.href = `tutor-profile.html?id=${tutorId}`;
}

// Export functions for potential use in other scripts
window.findTutors = {
    loadTutorsFromSupabase,
    filterTutors,
    clearFilters,
    viewTutorProfile
}; 