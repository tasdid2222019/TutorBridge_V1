// Supabase Client Configuration for TutorBridge
// Provides centralized database access with fallback mechanisms

// Supabase configuration (your actual values)
const supabaseUrl = "https://sdqlgkyivhbmggzymptp.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcWxna3lpdmhibWdnenltcHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTc2MTYsImV4cCI6MjA3MTI5MzYxNn0.sbrRtzkmMdbYzoNgYlKbLjdW7eD6s-6J3eDuvk7w2y0"
// Global Supabase instance
let supabaseInstance = null;

/**
 * Initialize Supabase client
 * @returns {Object|null} Supabase client instance or null if initialization fails
 */
function initSupabase() {
    try {
        // Check if Supabase is already initialized
        if (supabaseInstance) {
            return supabaseInstance;
        }

        // Check if Supabase library is available
        if (typeof window.supabase === 'undefined') {
            console.warn('Supabase library not loaded. Using mock mode.');
            return null;
        }

        // Create Supabase client instance
        supabaseInstance = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true
            }
        });
        return supabaseInstance;

    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return null;
    }
}

/**
 * Test Supabase connection
 * @param {Object} supabase - Supabase client instance
 */
async function testSupabaseConnection(supabase) {
    try {
        // Simple connection test
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
        
        if (error) {
            console.warn('Supabase connection test failed:', error.message);
        } else {
            console.log('✅ Supabase connection successful');
        }
    } catch (error) {
        console.warn('Supabase connection test error:', error.message);
    }
}

/**
 * Get current user ID (with fallback)
 * @returns {string|number} User ID or fallback value
 */
function currentUserId() {
    try {
        // Try to get from session storage first
        const currentUser = window.auth?.getCurrentUser();
        if (currentUser?.id) {
            return currentUser.id;
        }

        // Avoid calling Supabase auth synchronously (getUser() is async in v2)
        // Use async helper currentUserIdAsync() if you need Supabase lookup.

        // Fallback for development
        return 1001;
    } catch (error) {
        console.warn('Error getting current user ID:', error);
        return 1001; // Mock user ID for development
    }
}

/**
 * Async version: Get current user ID using Supabase when available
 * @returns {Promise<string|number>}
 */
async function currentUserIdAsync() {
    try {
        // Prefer session storage
        const currentUser = window.auth?.getCurrentUser?.();
        if (currentUser?.id) return currentUser.id;

        const supabase = initSupabase();
        if (supabase?.auth?.getUser) {
            const { data, error } = await supabase.auth.getUser();
            if (!error && data?.user?.id) return data.user.id;
        }
    } catch (e) {
        console.warn('currentUserIdAsync error:', e);
    }
    return 1001;
}

/**
 * Get current user profile (id and role)
 * @returns {{ id: string|number, role: 'admin'|'tutor'|'student' }|null}
 */
function currentUserProfile() {
    try {
        // Try to get from session storage first
        const currentUser = window.auth?.getCurrentUser();
        if (currentUser) {
            return currentUser;
        }

        // Try to get from Supabase
        const supabase = initSupabase();
        if (supabase) {
            // This would need to be async in real implementation
            // For now, return null to trigger fallback
            return null;
        }

        // Mock admin profile for development
        return { id: currentUserId(), role: 'admin' };
    } catch (error) {
        console.warn('Error getting current user profile:', error);
        return { id: currentUserId(), role: 'admin' };
    }
}

/**
 * Check if Supabase is available and working
 * @returns {boolean}
 */
function isSupabaseAvailable() {
    try {
        const supabase = initSupabase();
        return supabase !== null;
    } catch (error) {
        return false;
    }
}

/**
 * Get Supabase client with error handling
 * @returns {Object|null} Supabase client or null
 */
function getSupabaseClient() {
    try {
        return initSupabase();
    } catch (error) {
        console.error('Error getting Supabase client:', error);
        return null;
    }
}

/**
 * Execute Supabase query with fallback
 * @param {Function} queryFn - Function that returns Supabase query
 * @param {*} fallbackData - Data to return if query fails
 * @returns {Promise<*>} Query result or fallback data
 */
async function executeQuery(queryFn, fallbackData = null) {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            console.warn('Supabase not available, using fallback data');
            return fallbackData;
        }

        const result = await queryFn(supabase);
        return result;
    } catch (error) {
        console.error('Supabase query failed:', error);
        return fallbackData;
    }
}

// Export functions for use in other scripts
window.initSupabase = initSupabase;
window.currentUserId = currentUserId;
window.currentUserIdAsync = currentUserIdAsync;
window.currentUserProfile = currentUserProfile;
window.isSupabaseAvailable = isSupabaseAvailable;
window.getSupabaseClient = getSupabaseClient;
window.executeQuery = executeQuery;

// Auto-initialize Supabase when library is available
document.addEventListener('DOMContentLoaded', function() {
    // Check if Supabase library is loaded
    if (typeof window.supabase !== 'undefined') {
        initSupabase();
    } else {
        // Try again after a short delay
        setTimeout(() => {
            if (typeof window.supabase !== 'undefined') {
                initSupabase();
            }
        }, 1000);
    }
});

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSupabase,
        currentUserId,
        currentUserIdAsync,
        currentUserProfile,
        isSupabaseAvailable,
        getSupabaseClient,
        executeQuery
    };
}
