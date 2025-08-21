// Profile Page JavaScript
// This file handles the profile page functionality with sample data
// Ready for Supabase integration later

// Placeholder for current user ID - will be replaced with Supabase auth
const currentUserId = 123;

// Sample profile data - will be replaced with Supabase queries
const sampleProfile = {
    id: 123,
    fullName: "Dr. Sarah Ahmed",
    email: "sarah.ahmed@email.com",
    phone: "+880 1712 345 678",
    location: "Dhaka",
    subjects: ["Mathematics", "Physics", "Chemistry"],
    classLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    hourlyRate: 800,
    availability: "Both weekdays and weekends",
    experience: "5-10",
    qualification: "Master's Degree",
    institution: "University of Dhaka",
    bio: "Experienced mathematics and science tutor with over 8 years of teaching experience. Specialized in helping students understand complex concepts through practical examples and interactive learning methods. Passionate about making science and math accessible to all students.",
    profilePicture: null,
    certificates: [],
    rating: 4.8,
    totalStudents: 45,
    completedSessions: 320
};

// Badge update function
function updateBadges() {
    // Update other badges (placeholder values for now)
    const appsBadge = document.getElementById('badge-apps');
    if (appsBadge) {
        appsBadge.textContent = '2';
    }

    const requestsBadge = document.getElementById('badge-requests');
    if (requestsBadge) {
        requestsBadge.textContent = '5';
    }

    const msgBadge = document.getElementById('badge-msg');
    if (msgBadge) {
        const unreadCount = 3; // This will come from Supabase later
        msgBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    const bellBadge = document.getElementById('badge-bell');
    if (bellBadge) {
        const totalNotifications = 2 + 5 + 3; // +2 for apps, +5 for requests, +3 for messages
        bellBadge.textContent = totalNotifications;
        bellBadge.style.display = totalNotifications > 0 ? 'flex' : 'none';
    }
}

// Populate form with profile data
function populateProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    // Populate basic fields
    document.getElementById('full-name').value = sampleProfile.fullName;
    document.getElementById('email').value = sampleProfile.email;
    document.getElementById('phone').value = sampleProfile.phone;
    document.getElementById('location').value = sampleProfile.location;
    document.getElementById('hourly-rate').value = sampleProfile.hourlyRate;
    document.getElementById('availability').value = sampleProfile.availability;
    document.getElementById('experience').value = sampleProfile.experience;
    document.getElementById('qualification').value = sampleProfile.qualification;
    document.getElementById('institution').value = sampleProfile.institution;
    document.getElementById('bio').value = sampleProfile.bio;

    // Populate multiple select fields
    populateMultipleSelect('subjects', sampleProfile.subjects);
    populateMultipleSelect('class-levels', sampleProfile.classLevels);
}

// Helper function to populate multiple select fields
function populateMultipleSelect(selectId, selectedValues) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Clear previous selections
    Array.from(select.options).forEach(option => {
        option.selected = false;
    });

    // Set new selections
    selectedValues.forEach(value => {
        const option = Array.from(select.options).find(opt => opt.value === value);
        if (option) {
            option.selected = true;
        }
    });
}

// Get form data
function getFormData() {
    const form = document.getElementById('profile-form');
    if (!form) return null;

    const formData = new FormData(form);
    
    // Convert FormData to object
    const data = {};
    for (let [key, value] of formData.entries()) {
        if (key === 'subjects' || key === 'classLevels') {
            // Handle multiple select values
            if (!data[key]) {
                data[key] = [];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }

    return data;
}

// Validate form data
function validateFormData(data) {
    const errors = [];

    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push("Full name must be at least 2 characters long");
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push("Please enter a valid email address");
    }

    if (!data.phone || data.phone.trim().length < 10) {
        errors.push("Please enter a valid phone number");
    }

    if (!data.location) {
        errors.push("Please select your location");
    }

    if (!data.subjects || data.subjects.length === 0) {
        errors.push("Please select at least one subject");
    }

    if (!data.classLevels || data.classLevels.length === 0) {
        errors.push("Please select at least one class level");
    }

    if (!data.hourlyRate || data.hourlyRate < 100) {
        errors.push("Hourly rate must be at least ৳100");
    }

    if (!data.availability) {
        errors.push("Please select your availability");
    }

    if (!data.experience) {
        errors.push("Please select your experience level");
    }

    if (!data.qualification) {
        errors.push("Please select your qualification");
    }

    if (!data.bio || data.bio.trim().length < 50) {
        errors.push("Bio must be at least 50 characters long");
    }

    return errors;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show validation errors
function showValidationErrors(errors) {
    if (errors.length === 0) return;

    const errorMessage = errors.join('\n');
    alert('Please fix the following errors:\n\n' + errorMessage);
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    console.log('Profile form submitted');
    
    // Get form data
    const formData = getFormData();
    if (!formData) return;
    
    // Validate form data
    const errors = validateFormData(formData);
    if (errors.length > 0) {
        showValidationErrors(errors);
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('.save-button');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitButton.disabled = true;
    
    try {
        // TODO: Save profile data to Supabase
        // const { data, error } = await supabase
        //     .from("tutor_profiles")
        //     .update({
        //         full_name: formData.fullName,
        //         email: formData.email,
        //         phone: formData.phone,
        //         location: formData.location,
        //         subjects: formData.subjects,
        //         class_levels: formData.classLevels,
        //         hourly_rate: parseInt(formData.hourlyRate),
        //         availability: formData.availability,
        //         experience: formData.experience,
        //         qualification: formData.qualification,
        //         institution: formData.institution,
        //         bio: formData.bio,
        //         updated_at: new Date().toISOString()
        //     })
        //     .eq("tutor_id", currentUserId);
        
        // if (error) {
        //     throw error;
        // }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        alert('Profile updated successfully!');
        
        // Update local profile data
        Object.assign(sampleProfile, formData);
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Handle file uploads
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (5MB for images, 10MB for documents)
    const maxSize = event.target.name === 'profilePicture' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        event.target.value = '';
        return;
    }
    
    // Validate file type
    if (event.target.name === 'profilePicture') {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            event.target.value = '';
            return;
        }
    } else if (event.target.name === 'certificates') {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            alert('Please select a PDF, DOC, or DOCX file');
            event.target.value = '';
            return;
        }
    }
    
    console.log(`File selected: ${file.name} (${file.size} bytes)`);
    
    // TODO: Upload file to Supabase storage
    // const { data, error } = await supabase.storage
    //     .from('tutor-files')
    //     .upload(`${currentUserId}/${file.name}`, file);
}

// Supabase integration placeholders
async function loadProfileFromSupabase() {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //     .from("tutor_profiles")
    //     .select("*")
    //     .eq("tutor_id", currentUserId)
    //     .single();
    
    // if (error) {
    //     console.error("Error loading profile:", error);
    //     return null;
    // }
    
    // return data;
    return sampleProfile;
}

async function saveProfileToSupabase(profileData) {
    // TODO: Replace with actual Supabase update
    // const { data, error } = await supabase
    //     .from("tutor_profiles")
    //     .upsert({
    //         tutor_id: currentUserId,
    //         ...profileData,
    //         updated_at: new Date().toISOString()
    //     });
    
    // if (error) {
    //     throw error;
    // }
    
    // return data;
    return { success: true };
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page initialized');
    
    // Update badges
    updateBadges();
    
    // Populate form with profile data
    populateProfileForm();
    
    // Add form submission event listener
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Add file upload event listeners
    const profilePictureInput = document.getElementById('profile-picture');
    const certificatesInput = document.getElementById('certificates');
    
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', handleFileUpload);
    }
    
    if (certificatesInput) {
        certificatesInput.addEventListener('change', handleFileUpload);
    }
    
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
window.profilePage = {
    populateProfileForm,
    getFormData,
    validateFormData,
    handleFormSubmit,
    loadProfileFromSupabase,
    saveProfileToSupabase,
    updateBadges
};
