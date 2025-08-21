// TutorBridge Main JavaScript
// Handles dynamic content rendering and search functionality with Supabase integration

// Mock data fallback (will be replaced by backend API calls)
const fallbackTutors = [
    {
        id: 1,
        name: "Sarah Ahmed",
        subject: "Mathematics",
        rating: 5.0,
        location: "Dhaka",
        imageUrl: "assets/images/tutor1.jpg"
    },
    {
        id: 2, 
        name: "Ayesha Rahman",
        subject: "English",
        rating: 4.8,
        location: "Chittagong",
        imageUrl: "assets/images/tutor2.jpg"
    },
    {
        id: 3,
        name: "Md. Hasan Ali",
        subject: "Science",
        rating: 4.7,
        location: "Khulna",
        imageUrl: "assets/images/tutor3.jpg"
    },
    {
        id: 4,
        name: "Zakin Chowdkury",
        subject: "Physics",
        rating: 5.0,
        location: "Dhaka",
        imageUrl: "assets/images/tutor4.jpg"
    }
];

// Function to render tutor cards dynamically
function renderTutors(tutorsArray) {
    const tutorList = document.getElementById('tutor-list');
    const loading = document.getElementById('loading');
    
    if (!tutorList) {
        console.error('Tutor list container not found');
        return;
    }
    
    // Hide loading message
    if (loading) {
        loading.style.display = 'none';
    }
    
    // Clear existing content
    tutorList.innerHTML = '';
    
    if (!tutorsArray || tutorsArray.length === 0) {
        tutorList.innerHTML = `
            <div class="empty-state">
                <h3>No Featured Tutors Available</h3>
                <p>Check back later for featured tutors or browse all available tutors.</p>
                <a href="pages/find-tutors.html" class="btn-primary">Browse All Tutors</a>
            </div>
        `;
        return;
    }
    
    // Render each tutor card
    tutorsArray.forEach(tutor => {
        const tutorCard = document.createElement('div');
        tutorCard.className = 'tutor-card';
        tutorCard.innerHTML = `
            <img src="${tutor.imageUrl || tutor.image_url}" alt="${tutor.name}" onerror="this.src='assets/images/tutoring session image.png'">
            <h3>${tutor.name}</h3>
            <p>${tutor.subject}</p>
            <div class="rating">${'★'.repeat(Math.floor(tutor.rating))}${'☆'.repeat(5 - Math.floor(tutor.rating))} ${tutor.rating}</div>
            <div class="location">${tutor.location}</div>
            <button onclick="viewTutorProfile(${tutor.id})">View Profile</button>
        `;
        tutorList.appendChild(tutorCard);
    });
}

// Function to load featured tutors from Supabase
async function loadFeaturedTutors() {
    try {
        const supabase = window.getSupabaseClient();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        // 🔑 Supabase Query: Get featured tutors
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                subjects,
                rating,
                location,
                profile_image_url,
                is_featured
            `)
            .eq('role', 'tutor')
            .eq('is_featured', true)
            .eq('status', 'active')
            .order('rating', { ascending: false })
            .limit(4);

        if (error) throw error;

        // Transform data to match expected format
        const tutors = data.map(tutor => ({
            id: tutor.id,
            name: tutor.full_name,
            subject: Array.isArray(tutor.subjects) ? tutor.subjects[0] : tutor.subjects,
            rating: tutor.rating || 4.5,
            location: tutor.location,
            imageUrl: tutor.profile_image_url
        }));

        console.log('✅ Featured tutors loaded from Supabase:', tutors);
        renderTutors(tutors);

    } catch (error) {
        console.error('Error loading featured tutors:', error);
        // Fallback to mock data
        console.log('🔧 Using fallback data for featured tutors');
        renderTutors(fallbackTutors);
    }
}

// Function to handle tutor profile view
function viewTutorProfile(tutorId) {
    console.log(`Viewing profile for tutor ID: ${tutorId}`);
    window.location.href = `pages/tutor-profile.html?id=${tutorId}`;
}

// Search form submission handler
function initializeSearchForm() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const searchData = {
                subject: document.getElementById('search-subject').value,
                classLevel: document.getElementById('search-class-level').value,
                location: document.getElementById('search-location').value,
                tuitionType: document.getElementById('search-tuition-type').value
            };
            
            console.log('Search query:', searchData);
            
            // Redirect to find-tutors page with search parameters
            const params = new URLSearchParams();
            if (searchData.subject) params.append('subject', searchData.subject);
            if (searchData.classLevel) params.append('class', searchData.classLevel);
            if (searchData.location) params.append('location', searchData.location);
            if (searchData.tuitionType) params.append('type', searchData.tuitionType);
            
            const queryString = params.toString();
            const redirectUrl = `pages/find-tutors.html${queryString ? '?' + queryString : ''}`;
            
            window.location.href = redirectUrl;
        });
    }
}

// Function to populate search form options from Supabase
async function populateSearchOptions() {
    try {
        const supabase = window.getSupabaseClient();
        if (!supabase) {
            // Fallback to static options
            console.log('🔧 Supabase not available, using static options');
            populateStaticOptions();
            return;
        }

        // 🔑 Supabase Query: Get available subjects and class levels
        const [subjectsResult, classLevelsResult] = await Promise.all([
            supabase
                .from('profiles')
                .select('subjects')
                .eq('role', 'tutor')
                .eq('status', 'active')
                .not('subjects', 'is', null),
            supabase
                .from('tuition_requests')
                .select('class_level')
                .eq('status', 'open')
                .not('class_level', 'is', null)
        ]);

        // Extract unique subjects
        const subjects = new Set();
        if (subjectsResult.data) {
            subjectsResult.data.forEach(profile => {
                if (Array.isArray(profile.subjects)) {
                    profile.subjects.forEach(subject => subjects.add(subject));
                }
            });
        }

        // Extract unique class levels
        const classLevels = new Set();
        if (classLevelsResult.data) {
            classLevelsResult.data.forEach(request => {
                if (request.class_level) classLevels.add(request.class_level);
            });
        }

        // Populate dropdowns
        populateDropdown('search-subject', Array.from(subjects).sort());
        populateDropdown('search-class-level', Array.from(classLevels).sort());

        console.log('✅ Search options loaded from Supabase');

    } catch (error) {
        console.error('Error loading search options:', error);
        // Fallback to static options
        console.log('🔧 Using static options due to error');
        populateStaticOptions();
    }
}

// Function to populate static options (fallback)
function populateStaticOptions() {
    const subjects = ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];
    const classLevels = ['Primary', 'Secondary', 'Higher Secondary', 'University'];
    const tuitionTypes = ['Home Tuition', 'Online', 'Group Class', 'One-on-One'];
    
    populateDropdown('search-subject', subjects);
    populateDropdown('search-class-level', classLevels);
    populateDropdown('search-tuition-type', tuitionTypes);
}

// Helper function to populate dropdown
function populateDropdown(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Clear existing options (except the first placeholder)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Add new options
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// Function to check authentication status
function checkAuthStatus() {
    const currentUser = window.auth?.getCurrentUser();
    const signInBtn = document.querySelector('.sign-in-btn');
    
    if (currentUser) {
        // User is logged in, show dashboard link
        if (signInBtn) {
            signInBtn.textContent = 'Dashboard';
            signInBtn.onclick = () => window.auth.redirectByRole();
        }
    }
}

// Function to update connection status indicator
function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('status-text');
    const statusContainer = document.getElementById('connection-status');
    
    if (statusElement && statusContainer) {
        if (isConnected) {
            statusElement.textContent = '✅ Backend Connected';
            statusContainer.style.background = 'rgba(92, 225, 230, 0.2)';
            statusContainer.style.color = '#5ce1e6';
        } else {
            statusElement.textContent = '🔧 Using Fallback';
            statusContainer.style.background = 'rgba(238, 183, 183, 0.2)';
            statusContainer.style.color = '#eeb7b7';
        }
    }
}

// Function to initialize Supabase connection
async function initializeSupabase() {
    try {
        // Wait for Supabase to be available
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            if (typeof window.supabase !== 'undefined') {
                console.log('✅ Supabase library loaded');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase library not loaded after maximum attempts');
            return false;
        }
        
        // Initialize Supabase client
        const supabase = window.getSupabaseClient();
        if (supabase) {
            console.log('✅ Supabase client initialized successfully');
            return true;
        } else {
            console.warn('⚠️ Failed to initialize Supabase client');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return false;
    }
}

// Initialize the page
async function initializePage() {
    try {
        console.log('🚀 Initializing TutorBridge main page...');
        
        // Initialize Supabase first
        const supabaseReady = await initializeSupabase();
        if (supabaseReady) {
            console.log('✅ Backend connected, loading real data');
            updateConnectionStatus(true);
        } else {
            console.log('🔧 Using fallback/mock data');
            updateConnectionStatus(false);
        }
        
        // Populate search form options
        await populateSearchOptions();
        
        // Initialize search form
        initializeSearchForm();
        
        // Check authentication status
        checkAuthStatus();
        
        // Load featured tutors
        await loadFeaturedTutors();
        
        console.log('✅ Main page initialization complete');
        
    } catch (error) {
        console.error('❌ Error initializing page:', error);
        // Fallback to mock data
        console.log('🔧 Falling back to mock data due to error');
        updateConnectionStatus(false);
        renderTutors(fallbackTutors);
        populateStaticOptions();
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Export functions for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderTutors,
        viewTutorProfile,
        initializeSearchForm,
        populateSearchOptions,
        loadFeaturedTutors,
        initializeSupabase
    };
}
