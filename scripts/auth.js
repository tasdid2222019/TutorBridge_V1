// scripts/auth.js
// Comprehensive authentication and session management for TutorBridge

/**
 * Get current user from session storage
 * @returns {{ id: string, email: string, role: string }|null}
 */
function getCurrentUser() {
    try {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing current user:', error);
        return null;
    }
}

/**
 * Fetch current user profile from Supabase after login
 * @param {string} userId - User ID from Supabase auth
 * @returns {Promise<Object|null>} - User profile or null
 */
async function getCurrentUserProfile(userId) {
    try {
        const supabase = window.getSupabaseClient?.();
        if (!supabase) {
            console.warn('Supabase client not available');
            return null;
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, email, role, name, status, created_at')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        // Store in session storage
        if (profile) {
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: profile.id,
                email: profile.email,
                role: profile.role,
                name: profile.name,
                status: profile.status
            }));
        }

        return profile;
    } catch (error) {
        console.error('Error in getCurrentUserProfile:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check ('admin', 'tutor', 'student')
 * @returns {boolean}
 */
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
function isAdmin() {
    return hasRole('admin');
}

/**
 * Check if user is tutor
 * @returns {boolean}
 */
function isTutor() {
    return hasRole('tutor');
}

/**
 * Check if user is student
 * @returns {boolean}
 */
function isStudent() {
    return hasRole('student');
}

/**
 * Redirect user based on their role
 */
function redirectByRole() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const currentPage = window.location.pathname.split('/').pop();
    
    // Don't redirect if already on correct page
    if (currentPage === 'admin-dashboard.html' && user.role === 'admin') return;
    if (currentPage === 'tutor-dashboard.html' && user.role === 'tutor') return;
    if (currentPage === 'student-dashboard.html' && user.role === 'student') return;

    // Redirect based on role
    switch (user.role) {
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        case 'tutor':
            window.location.href = 'tutor-dashboard.html';
            break;
        case 'student':
            window.location.href = 'student-dashboard.html';
            break;
        default:
            window.location.href = 'login.html';
    }
}

/**
 * Guard page access based on role
 * @param {string|string[]} allowedRoles - Role(s) allowed to access the page
 * @param {string} redirectUrl - URL to redirect unauthorized users
 */
function guardPage(allowedRoles, redirectUrl = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
        return false;
    }

    const user = getCurrentUser();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(user.role)) {
        console.warn(`Access denied: User role ${user.role} not allowed`);
        window.location.href = redirectUrl;
        return false;
    }

    return true;
}

/**
 * Logout user and clear session
 */
async function logout() {
    try {
        // Clear local/session storage
        localStorage.clear();
        sessionStorage.clear();

        // 🔑 Supabase signOut (when backend is ready)
        const supabase = window.initSupabase?.();
        if (supabase) {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.warn('Supabase signOut error:', error);
            }
        }

        // Redirect to login page
        window.location.href = "login.html";
    } catch (err) {
        console.error("Logout failed:", err.message);
        // Force redirect even if error
        window.location.href = "login.html";
    }
}

/**
 * Refresh user session from Supabase
 * @returns {Promise<boolean>} - Whether refresh was successful
 */
async function refreshSession() {
    try {
        const supabase = window.initSupabase?.();
        if (!supabase) return false;

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return false;

        // Update session storage with fresh user data
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, role')
            .eq('id', session.user.id)
            .single();

        if (profileError) return false;

        sessionStorage.setItem('currentUser', JSON.stringify({
            id: profile.id,
            email: profile.email,
            role: profile.role
        }));

        return true;
    } catch (error) {
        console.error('Session refresh failed:', error);
        return false;
    }
}

/**
 * Check if session is expired and refresh if needed
 * @returns {Promise<boolean>} - Whether session is valid
 */
async function checkSessionValidity() {
    if (!isAuthenticated()) {
        return false;
    }

    // Try to refresh session
    const refreshed = await refreshSession();
    if (!refreshed) {
        // Session invalid, logout user
        logout();
        return false;
    }

    return true;
}

/**
 * Initialize authentication for a page
 * @param {string|string[]} allowedRoles - Role(s) allowed to access the page
 * @param {string} redirectUrl - URL to redirect unauthorized users
 */
async function initAuth(allowedRoles, redirectUrl = 'login.html') {
    // Check session validity
    if (!(await checkSessionValidity())) {
        return false;
    }

    // Guard page access
    return guardPage(allowedRoles, redirectUrl);
}

// Auto-check session validity every 5 minutes
setInterval(checkSessionValidity, 5 * 60 * 1000);

// Export functions for use in other scripts
window.auth = {
    getCurrentUser,
    getCurrentUserProfile,
    isAuthenticated,
    hasRole,
    isAdmin,
    isTutor,
    isStudent,
    redirectByRole,
    guardPage,
    logout,
    refreshSession,
    checkSessionValidity,
    initAuth
};
