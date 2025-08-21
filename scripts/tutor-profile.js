// Tutor Profile Script with Supabase Integration
// Handles dynamic tutor profile loading and rendering

// Mock data fallback (will be replaced by backend API calls)
const fallbackTutors = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        subject: "Mathematics & Physics",
        location: "New York, NY",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
        bio: "I am a passionate educator with over 10 years of experience in teaching mathematics and physics at both high school and university levels. My approach focuses on making complex concepts accessible through real-world applications and interactive problem-solving.",
        expertise: ["Advanced Mathematics", "Calculus", "Linear Algebra", "Physics", "Mechanics", "Electromagnetism"],
        education: "Ph.D. in Applied Mathematics from MIT, M.S. in Physics from Stanford University, B.S. in Mathematics from Harvard University",
        teaching_style: "I believe in a student-centered approach that adapts to individual learning styles. My sessions combine theoretical understanding with practical applications, using technology and real-world examples to make learning engaging and relevant.",
        availability: [
            { day: "Monday", time: "3:00 PM - 8:00 PM" },
            { day: "Tuesday", time: "3:00 PM - 8:00 PM" },
            { day: "Wednesday", time: "3:00 PM - 8:00 PM" },
            { day: "Thursday", time: "3:00 PM - 8:00 PM" },
            { day: "Friday", time: "3:00 PM - 6:00 PM" },
            { day: "Saturday", time: "10:00 AM - 4:00 PM" }
        ]
    },
    {
        id: 2,
        name: "Prof. Michael Chen",
        subject: "Computer Science",
        location: "San Francisco, CA",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        bio: "As a computer science professor and industry veteran, I bring real-world software development experience into the classroom. I've worked at major tech companies and now focus on helping students understand both theoretical concepts and practical programming skills.",
        expertise: ["Programming", "Data Structures", "Algorithms", "Web Development", "Machine Learning", "Software Engineering"],
        education: "Ph.D. in Computer Science from UC Berkeley, M.S. in Computer Science from Stanford University, B.S. in Computer Science from UC Berkeley",
        teaching_style: "My teaching philosophy emphasizes hands-on learning through coding projects and real-world problem solving. I focus on building strong foundational knowledge while keeping students engaged with current industry trends and technologies.",
        availability: [
            { day: "Monday", time: "4:00 PM - 9:00 PM" },
            { day: "Tuesday", time: "4:00 PM - 9:00 PM" },
            { day: "Wednesday", time: "4:00 PM - 9:00 PM" },
            { day: "Thursday", time: "4:00 PM - 9:00 PM" },
            { day: "Friday", time: "4:00 PM - 7:00 PM" },
            { day: "Sunday", time: "1:00 PM - 6:00 PM" }
        ]
    }
];

// DOM elements
const loadingElement = document.getElementById('loading');
const tutorProfileElement = document.getElementById('tutor-profile');
const tutorNotFoundElement = document.getElementById('tutor-not-found');

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Get tutor ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tutorId = parseInt(urlParams.get('id'));
    
    if (tutorId) {
        await loadTutorProfile(tutorId);
    } else {
        showTutorNotFound();
    }
});

// Load and display tutor profile
async function loadTutorProfile(tutorId) {
    // Show loading
    showLoading();
    
    try {
        // Try to load from Supabase first
        const tutor = await loadTutorFromSupabase(tutorId);
        
        if (tutor) {
            hideLoading();
            renderTutorProfile(tutor);
        } else {
            // Fallback to mock data
            const mockTutor = fallbackTutors.find(t => t.id === tutorId);
            if (mockTutor) {
                hideLoading();
                renderTutorProfile(mockTutor);
            } else {
                hideLoading();
                showTutorNotFound();
            }
        }
    } catch (error) {
        console.error('Error loading tutor profile:', error);
        hideLoading();
        
        // Fallback to mock data
        const mockTutor = fallbackTutors.find(t => t.id === tutorId);
        if (mockTutor) {
            renderTutorProfile(mockTutor);
        } else {
            showTutorNotFound();
        }
    }
}

// Load tutor profile from Supabase
async function loadTutorFromSupabase(tutorId) {
    try {
        const supabase = window.initSupabase?.();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        // 🔑 Supabase Query: Get tutor profile by ID
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                subjects,
                location,
                rating,
                profile_image_url,
                bio,
                hourly_rate,
                experience,
                qualification,
                institution,
                availability,
                teaching_style
            `)
            .eq('id', tutorId)
            .eq('role', 'tutor')
            .eq('status', 'active')
            .single();

        if (error) throw error;
        if (!data) return null;

        // Transform data to match expected format
        return {
            id: data.id,
            name: data.full_name,
            subject: Array.isArray(data.subjects) ? data.subjects.join(' & ') : data.subjects,
            location: data.location,
            rating: data.rating || 4.0,
            image_url: data.profile_image_url,
            bio: data.bio || "No bio available.",
            expertise: Array.isArray(data.subjects) ? data.subjects : [data.subjects],
            education: `${data.qualification || 'Degree'}${data.institution ? ` from ${data.institution}` : ''}`,
            teaching_style: data.teaching_style || "Teaching style information not available.",
            availability: data.availability ? JSON.parse(data.availability) : [
                { day: "Contact for availability", time: "Flexible" }
            ]
        };

    } catch (error) {
        console.error('Error loading tutor from Supabase:', error);
        return null;
    }
}

// Show loading state
function showLoading() {
    loadingElement.style.display = 'flex';
    tutorProfileElement.style.display = 'none';
    tutorNotFoundElement.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingElement.style.display = 'none';
}

// Render tutor profile
function renderTutorProfile(tutor) {
    // Set profile image
    const tutorImage = document.getElementById('tutor-image');
    if (tutorImage) {
        tutorImage.src = tutor.image_url || `https://via.placeholder.com/300x300/5ce1e6/232946?text=${tutor.name.charAt(0)}`;
        tutorImage.alt = tutor.name;
    }
    
    // Set basic info
    const nameElement = document.getElementById('tutor-name');
    if (nameElement) nameElement.textContent = tutor.name;
    
    const subjectElement = document.getElementById('tutor-subject');
    if (subjectElement) subjectElement.textContent = tutor.subject;
    
    const locationElement = document.querySelector('#tutor-location span');
    if (locationElement) locationElement.textContent = tutor.location;
    
    // Set rating
    const starsElement = document.querySelector('#tutor-rating .stars');
    const ratingTextElement = document.querySelector('#tutor-rating .rating-text');
    if (starsElement) starsElement.textContent = '★'.repeat(Math.floor(tutor.rating)) + '☆'.repeat(5 - Math.floor(tutor.rating));
    if (ratingTextElement) ratingTextElement.textContent = `${tutor.rating}/5`;
    
    // Set bio
    const bioElement = document.getElementById('tutor-bio');
    if (bioElement) bioElement.textContent = tutor.bio;
    
    // Set expertise
    const expertiseElement = document.getElementById('tutor-expertise');
    if (expertiseElement && Array.isArray(tutor.expertise)) {
        expertiseElement.innerHTML = tutor.expertise.map(skill => 
            `<span class="expertise-tag">${skill}</span>`
        ).join('');
    }
    
    // Set education
    const educationElement = document.getElementById('tutor-education');
    if (educationElement) educationElement.textContent = tutor.education;
    
    // Set teaching style
    const teachingStyleElement = document.getElementById('tutor-teaching-style');
    if (teachingStyleElement) teachingStyleElement.textContent = tutor.teaching_style;
    
    // Set availability
    const availabilityElement = document.getElementById('tutor-availability');
    if (availabilityElement && Array.isArray(tutor.availability)) {
        availabilityElement.innerHTML = tutor.availability.map(day => 
            `<div class="availability-day">
                <h4>${day.day}</h4>
                <p class="availability-time">${day.time}</p>
            </div>`
        ).join('');
    }
    
    // Show profile
    tutorProfileElement.style.display = 'block';
}

// Show tutor not found message
function showTutorNotFound() {
    if (tutorNotFoundElement) {
        tutorNotFoundElement.style.display = 'block';
    }
}

// Export functions for potential use in other scripts
window.tutorProfile = {
    loadTutorProfile,
    loadTutorFromSupabase,
    renderTutorProfile
}; 