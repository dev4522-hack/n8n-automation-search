// Supabase configuration
const SUPABASE_URL = 'https://fmdxmvolwlvbvrqxkrth.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZHhtdm9sd2x2YnZycXhrcnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg1NzAsImV4cCI6MjA3NTQ3NDU3MH0.HVTxZL1E2VA37J-szB9Su0Ny1nIEuRHj6rTIZ5l4d_w'

// Simple direct initialization
console.log('Loading Supabase helpers...');

// Initialize immediately
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;

// Auth helper functions
window.authHelpers = {
    // Get current user
    getCurrentUser: async () => {
        const { data: { user } } = await supabaseClient.auth.getUser()
        return user
    },

    // Sign up with email and password
    signUp: async (email, password, userData = {}) => {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        })
        return { data, error }
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabaseClient.auth.signOut()
        return { error }
    },

    // Sign in with Google
    signInWithGoogle: async () => {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google'
        })
        return { data, error }
    },

    // Sign in with GitHub
    signInWithGitHub: async () => {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'github'
        })
        return { data, error }
    },

    // Sign in with Apple
    signInWithApple: async () => {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'apple'
        })
        return { data, error }
    },

    // Listen to auth changes
    onAuthChange: (callback) => {
        return supabaseClient.auth.onAuthStateChange(callback)
    }
}

// Database helper functions
window.dbHelpers = {
    // Add template to favorites
    addToFavorites: async (userId, templateData) => {
        const { data, error } = await supabaseClient
            .from('favorites')
            .insert({
                user_id: userId,
                template_name: templateData.name,
                template_description: templateData.description,
                template_thumbnail: templateData.thumbnail,
                template_url: templateData.url,
                created_at: new Date().toISOString()
            })
        return { data, error }
    },

    // Remove from favorites
    removeFromFavorites: async (userId, templateName) => {
        const { data, error } = await supabaseClient
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('template_name', templateName)
        return { data, error }
    },

    // Get user favorites
    getFavorites: async (userId) => {
        const { data, error } = await supabaseClient
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        return { data, error }
    },

    // Save search history
    saveSearch: async (userId, searchTerm) => {
        const { data, error } = await supabaseClient
            .from('search_history')
            .insert({
                user_id: userId,
                search_term: searchTerm,
                searched_at: new Date().toISOString()
            })
        return { data, error }
    },

    // Get search history
    getSearchHistory: async (userId, limit = 10) => {
        const { data, error } = await supabaseClient
            .from('search_history')
            .select('*')
            .eq('user_id', userId)
            .order('searched_at', { ascending: false })
            .limit(limit)
        return { data, error }
    },

    // Update user profile
    updateProfile: async (userId, profileData) => {
        const { data, error } = await supabaseClient
            .from('profiles')
            .upsert({
                id: userId,
                ...profileData,
                updated_at: new Date().toISOString()
            })
        return { data, error }
    },

    // Get user profile
    getProfile: async (userId) => {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        return { data, error }
    }
};

// Database helper functions
window.dbHelpers = {
    // Add template to favorites
    addToFavorites: async (userId, templateData) => {
        const { data, error } = await supabaseClient
            .from('favorites')
            .insert({
                user_id: userId,
                template_name: templateData.Name,
                template_description: templateData.Description,
                template_thumbnail: templateData.Youtube_url,
                template_url: templateData.Template_url,
                created_at: new Date().toISOString()
            })
        return { data, error }
    },

    // Remove from favorites
    removeFromFavorites: async (userId, templateName) => {
        const { data, error } = await supabaseClient
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('template_name', templateName)
        return { data, error }
    },

    // Get user favorites
    getFavorites: async (userId) => {
        const { data, error } = await supabaseClient
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        return { data, error }
    },

    // Save search history
    saveSearch: async (userId, searchTerm) => {
        const { data, error } = await supabaseClient
            .from('search_history')
            .insert({
                user_id: userId,
                search_term: searchTerm,
                searched_at: new Date().toISOString()
            })
        return { data, error }
    },

    // Get search history
    getSearchHistory: async (userId, limit = 10) => {
        const { data, error } = await supabaseClient
            .from('search_history')
            .select('*')
            .eq('user_id', userId)
            .order('searched_at', { ascending: false })
            .limit(limit)
        return { data, error }
    },

    // Update user profile
    updateProfile: async (userId, profileData) => {
        const { data, error } = await supabaseClient
            .from('profiles')
            .upsert({
                id: userId,
                ...profileData,
                updated_at: new Date().toISOString()
            })
        return { data, error }
    },

    // Get user profile
    getProfile: async (userId) => {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        return { data, error }
    }
};

console.log('✅ Supabase helpers loaded successfully!');