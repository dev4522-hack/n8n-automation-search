const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const sortFilter = document.getElementById('sortFilter');

// Filter state
const filterState = {
    search: '',
    sort: 'popular'
};

// Filter data object to store results
const filterData = {
    results: []
};

// Authentication state
let currentUser = null;
let userFavorites = [];
let welcomeScreenActive = true; // Flag to prevent automatic template loading

// Authentication DOM elements
const loginBtn = document.getElementById('loginBtn');
const userMenu = document.getElementById('userMenu');
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const authForm = document.getElementById('authForm');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const githubSignInBtn = document.getElementById('githubSignInBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileLink = document.getElementById('profileLink');
const favoritesLink = document.getElementById('favoritesLink');
const historyLink = document.getElementById('historyLink');

// Authentication functions
function updateAuthUI(user) {
    currentUser = user;
    
    if (user) {
        // User is logged in
        loginBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
        
        // Update user info
        document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
        document.getElementById('userAvatar').src = user.user_metadata?.avatar_url || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email)}&background=4ade80&color=000&size=128`;
        
        // Update search placeholder for logged-in users
        searchInput.placeholder = "Search 235+ automation templates...";
        searchInput.classList.remove('cursor-pointer');
        
        // Show welcome notification
        showWelcomeNotification(user);
        
        // Load user favorites
        loadUserFavorites();
    } else {
        // User is logged out
        loginBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
        currentUser = null;
        userFavorites = [];
        
        // Update search placeholder for non-authenticated users
        searchInput.placeholder = "Click to unlock advanced search features...";
        searchInput.classList.add('cursor-pointer');
    }
}

function showWelcomeNotification(user) {
    // Show a subtle welcome notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300';
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="font-medium">Welcome back, ${user.user_metadata?.full_name || user.email.split('@')[0]}!</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Slide out after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

async function loadUserFavorites() {
    if (!currentUser) return;
    
    try {
        const { data, error } = await dbHelpers.getFavorites(currentUser.id);
        if (error) throw error;
        userFavorites = data || [];
        updateFavoriteButtons();
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        const templateName = btn.dataset.templateName;
        const isFavorite = userFavorites.some(fav => fav.template_name === templateName);
        
        btn.innerHTML = isFavorite 
            ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
            : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>';
        
        btn.classList.toggle('text-red-500', isFavorite);
        btn.classList.toggle('text-gray-400', !isFavorite);
    });
}

async function toggleFavorite(templateData) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    try {
        const isFavorite = userFavorites.some(fav => fav.template_name === templateData.Name);
        
        if (isFavorite) {
            const { error } = await dbHelpers.removeFromFavorites(currentUser.id, templateData.Name);
            if (error) throw error;
            userFavorites = userFavorites.filter(fav => fav.template_name !== templateData.Name);
        } else {
            const { error } = await dbHelpers.addToFavorites(currentUser.id, templateData);
            if (error) throw error;
            userFavorites.push({
                template_name: templateData.Name,
                template_description: templateData.Description,
                template_thumbnail: templateData.Youtube_url,
                template_url: templateData.Template_url
            });
        }
        
        updateFavoriteButtons();
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Failed to update favorite. Please try again.');
    }
}

function showSearchSignUpPrompt() {
    // Create a custom modal for search signup prompt
    const existingPrompt = document.getElementById('searchSignUpPrompt');
    if (existingPrompt) {
        existingPrompt.remove();
    }
    
    const prompt = document.createElement('div');
    prompt.id = 'searchSignUpPrompt';
    prompt.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    prompt.innerHTML = `
        <div class="modal-content bg-black/95 border border-green-500/30 rounded-2xl p-8 w-full max-w-md mx-4 backdrop-blur-sm show">
            <div class="text-center">
                <div class="mb-4">
                    <svg class="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-white mb-3">Unlock Advanced Search</h2>
                <p class="text-gray-300 mb-6">Create an account to access powerful search features, save your favorite templates, and track your search history.</p>
                
                <div class="space-y-3">
                    <button onclick="closeSearchPrompt(); showAuthModal(true);" 
                            class="w-full auth-submit-btn text-white font-bold py-3 px-6 rounded-xl">
                        Create Account
                    </button>
                    <button onclick="closeSearchPrompt(); showAuthModal(false);" 
                            class="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all">
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(prompt);
    
    // Close on click outside
    prompt.addEventListener('click', (e) => {
        if (e.target === prompt) {
            closeSearchPrompt();
        }
    });
}

function closeSearchPrompt() {
    const prompt = document.getElementById('searchSignUpPrompt');
    if (prompt) {
        prompt.remove();
    }
}

function showAuthModal(isSignUp = false) {
    console.log('showAuthModal called with isSignUp:', isSignUp);
    
    const modal = document.getElementById('authModal');
    console.log('Modal element:', modal);
    
    if (!modal) {
        console.error('Auth modal not found!');
        alert('Modal not found in HTML!');
        return;
    }
    
    const modalContent = modal.querySelector('.modal-content');
    console.log('Modal content:', modalContent);
    
    const modalTitle = document.getElementById('modalTitle');
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('toggleText');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    
    console.log('Modal elements found:', {
        modalTitle: !!modalTitle,
        nameField: !!nameField,
        submitBtn: !!submitBtn,
        toggleText: !!toggleText,
        toggleAuthMode: !!toggleAuthMode
    });
    
    // Set up modal for login or signup
    if (isSignUp) {
        modalTitle.textContent = 'Sign Up';
        nameField.classList.remove('hidden');
        submitBtn.textContent = 'Sign Up';
        toggleText.textContent = 'Already have an account?';
        toggleAuthMode.textContent = 'Sign in';
    } else {
        modalTitle.textContent = 'Sign In';
        nameField.classList.add('hidden');
        submitBtn.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleAuthMode.textContent = 'Sign up';
    }
    
    console.log('Showing modal...');
    modal.classList.remove('hidden');
    setTimeout(() => {
        if (modalContent) {
            modalContent.classList.add('show');
            console.log('Modal content shown');
        }
    }, 10);
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.classList.remove('show');
    setTimeout(() => {
        modal.classList.add('hidden');
        // Reset form
        document.getElementById('authForm').reset();
    }, 300);
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    if (!window.authHelpers) {
        alert('Authentication service is not available. Please refresh the page.');
        return;
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName').value;
    const isSignUp = document.getElementById('modalTitle').textContent === 'Sign Up';
    
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    
    try {
        let result;
        
        if (isSignUp) {
            result = await authHelpers.signUp(email, password, { full_name: fullName });
            if (result.error) throw result.error;
            
            alert('Sign up successful! Please check your email to verify your account.');
            hideAuthModal();
        } else {
            result = await authHelpers.signIn(email, password);
            if (result.error) throw result.error;
            
            hideAuthModal();
        }
    } catch (error) {
        console.error('Auth error:', error);
        alert(error.message || 'Authentication failed. Please try again.');
    }
}

async function handleSocialLogin(provider) {
    try {
        let result;
        
        if (provider === 'google') {
            result = await authHelpers.signInWithGoogle();
        } else if (provider === 'github') {
            result = await authHelpers.signInWithGitHub();
        }
        
        if (result.error) throw result.error;
        
        hideAuthModal();
    } catch (error) {
        console.error('Social login error:', error);
        alert(error.message || 'Social login failed. Please try again.');
    }
}

async function handleLogout() {
    try {
        const { error } = await authHelpers.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
    }
}

// Function to render a single template card
function renderCard(template) {
    const card = document.createElement('div');
    card.className = 'bg-black/50 rounded-lg overflow-hidden border border-green-500/30 hover:border-green-500/60 transition-all duration-300 group';
    
    const youtubeId = template.Youtube_url ? getYoutubeId(template.Youtube_url) : null;
    const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;
    
    // Create custom thumbnail based on automation type when no YouTube video
    const getCustomThumbnail = (name, creator) => {
        const colors = ['4F46E5', '7C3AED', 'DB2777', 'DC2626', 'EA580C', '059669'];
        const hash = (name + creator).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        const colorIndex = Math.abs(hash) % colors.length;
        const color = colors[colorIndex];
        
        return `https://via.placeholder.com/480x270/${color}/FFFFFF?text=${encodeURIComponent(name.substring(0, 20))}`;
    };

    card.innerHTML = `
        <div class="aspect-video bg-black/60 relative overflow-hidden">
            <img src="${thumbnailUrl || getCustomThumbnail(template.Name, template.Creator)}" 
                 alt="${template.Youtube_url ? 'Tutorial thumbnail' : 'Automation preview'}" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            ${template.Youtube_url ? `
                <div class="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    📺 TUTORIAL
                </div>
            ` : `
                <div class="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    🔧 TEMPLATE
                </div>
            `}
            <div class="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                by ${template.Creator || 'Unknown'}
            </div>
            ${currentUser ? `
                <button class="favorite-btn absolute top-3 left-3 p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors" 
                        data-template-name="${template.Name}" onclick="toggleFavorite(${JSON.stringify(template).replace(/"/g, '&quot;')})">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>
            ` : ''}
        </div>
        <div class="p-6">
            <div class="flex items-start gap-3 mb-4">
                <img src="${template.creatorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(template.Creator || 'Unknown')}&background=random&color=fff&size=128`}" 
                     alt="${template.Creator || 'Unknown'}" 
                     class="w-12 h-12 rounded-full border-2 border-green-500/30 flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <h3 class="text-xl font-semibold text-white group-hover:text-green-400 transition-colors mb-1 glow-text">
                        ${template.Name || 'Untitled Automation'}
                    </h3>
                    <p class="text-green-500 text-sm font-medium">by ${template.Creator || 'Unknown Creator'}</p>
                    ${template.Views ? `<p class="text-gray-500 text-xs mt-1">👁 ${template.Views} views</p>` : ''}
                </div>
            </div>
            <div class="mb-6">
                <p class="text-gray-400 leading-relaxed description-text transition-all duration-300" data-full="${encodeURIComponent(template.Description || 'No description available')}">
                    ${(template.Description || 'No description available').length > 120 
                        ? (template.Description || 'No description available').substring(0, 120) + '...'
                        : (template.Description || 'No description available')
                    }
                </p>
                ${(template.Description || '').length > 120 ? `
                    <button class="text-green-500 hover:text-green-400 text-sm mt-2 font-medium toggle-description transition-all duration-200 flex items-center gap-1">
                        <span class="toggle-text">Show More</span>
                        <svg class="w-3 h-3 toggle-icon transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
            <div class="space-y-3">
                ${template.Youtube_url ? `
                    <a href="${template.Youtube_url}" target="_blank" 
                       class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-all border border-red-500/30">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                        <span class="font-medium">Watch Tutorial</span>
                    </a>
                ` : ''}
                ${template.Template_url ? `
                    <a href="${template.Template_url}" target="_blank"
                       class="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 transition-all border border-green-500/30">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        <span class="font-medium">Download Template</span>
                    </a>
                ` : ''}
            </div>
        </div>
    `;
    
    // Add event listener for description toggle
    const toggleBtn = card.querySelector('.toggle-description');
    if (toggleBtn) {
        const descriptionText = card.querySelector('.description-text');
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        const fullDescription = decodeURIComponent(descriptionText.dataset.full);
        const shortDescription = fullDescription.length > 120 ? fullDescription.substring(0, 120) + '...' : fullDescription;
        let isExpanded = false;
        
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (isExpanded) {
                descriptionText.textContent = shortDescription;
                toggleText.textContent = 'Show More';
                toggleIcon.style.transform = 'rotate(0deg)';
                isExpanded = false;
            } else {
                descriptionText.textContent = fullDescription;
                toggleText.textContent = 'Show Less';
                toggleIcon.style.transform = 'rotate(180deg)';
                isExpanded = true;
            }
        });
    }
    
    return card;
}

// Function to display search results
function displayResults(results) {
    console.log('Displaying results:', results);
    resultsContainer.innerHTML = ''; // Clear previous results
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-400 text-lg">No templates found. Try a different search term.</p>
            </div>
        `;
        return;
    }
    
    results.forEach((template, index) => {
        console.log(`Rendering card ${index}:`, template);
        const card = renderCard(template);
        resultsContainer.appendChild(card);
    });
    
    console.log(`Rendered ${results.length} cards`);
}

// Function to get YouTube video ID
function getYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Function to apply filters and fetch workflows
async function applyFilters() {
    try {
        console.log('🎯 applyFilters: Called with state:', filterState);
        
        // If welcome screen should be active and no search term, show welcome instead
        if (welcomeScreenActive && !filterState.search.trim()) {
            console.log('🎯 applyFilters: Welcome screen active, showing welcome message instead');
            showWelcomeMessage();
            return;
        }
        
        // Set welcome screen to inactive when search is performed
        welcomeScreenActive = false;
        
        console.log('🎯 applyFilters: Proceeding with search');
        
        // Build query string based on filter state
        const params = new URLSearchParams({
            search: filterState.search,
            sort: filterState.sort
        });
        
        console.log('Fetching:', `/search?${params}`);
        const response = await fetch(`/search?${params}`);
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        console.log('Received data:', data);
        
        filterData.results = data.results || [];
        console.log('Processing results:', filterData.results.length, 'items');
        
        displayResults(filterData.results);
        
        // Scroll to results if needed
        if (filterState.search && filterData.results.length > 0) {
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-red-400 text-lg">Error loading results. Please try again.</p>
            </div>
        `;
    }
}

// Function to handle example searches
window.searchExample = function(term) {
    searchInput.value = term;
    filterState.search = term;
    applyFilters();
    searchInput.focus();
};

// Function to show welcome message
function showWelcomeMessage() {
    console.log('🎯 showWelcomeMessage: Starting to display welcome screen...');
    resultsContainer.innerHTML = `
        <div class="col-span-full text-center py-16">
            <div class="max-w-2xl mx-auto">
                <h2 class="text-4xl font-bold text-white mb-4">🚀 Welcome to n8n Automation Search</h2>
                <p class="text-xl text-gray-300 mb-6">Discover 235+ n8n automation templates created by the community</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div class="bg-green-900/20 p-6 rounded-lg border border-green-500/30">
                        <h3 class="text-lg font-semibold text-green-400 mb-2">🔍 Search Templates</h3>
                        <p class="text-gray-300">Type anything to search through hundreds of automation workflows</p>
                    </div>
                    <div class="bg-blue-900/20 p-6 rounded-lg border border-blue-500/30">
                        <h3 class="text-lg font-semibold text-blue-400 mb-2">❤️ Save Favorites</h3>
                        <p class="text-gray-300">Sign up to save your favorite templates and track search history</p>
                    </div>
                    <div class="bg-purple-900/20 p-6 rounded-lg border border-purple-500/30">
                        <h3 class="text-lg font-semibold text-purple-400 mb-2">🎬 Watch & Learn</h3>
                        <p class="text-gray-300">Each template includes YouTube tutorials and download links</p>
                    </div>
                </div>
                <div class="mt-8">
                    <p class="text-gray-400 mb-4">Ready to explore? Try searching for:</p>
                    <div class="flex flex-wrap justify-center gap-2">
                        <button onclick="searchExample('discord')" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm transition-colors">Discord</button>
                        <button onclick="searchExample('linkedin')" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm transition-colors">LinkedIn</button>
                        <button onclick="searchExample('email')" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm transition-colors">Email</button>
                        <button onclick="searchExample('ai')" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm transition-colors">AI</button>
                        <button onclick="searchExample('webhook')" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm transition-colors">Webhook</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to handle example searches
window.searchExample = function(searchTerm) {
    console.log('🎯 searchExample: Searching for:', searchTerm);
    welcomeScreenActive = false; // Disable welcome screen
    searchInput.value = searchTerm;
    filterState.search = searchTerm;
    applyFilters();
}

// Function to load initial data
async function loadInitialData() {
    try {
        console.log('🎯 loadInitialData: Starting...');
        
        // Initialize filter state
        filterState.search = '';
        filterState.sort = 'popular';
        
        // Update UI to match filter state
        searchInput.value = '';
        sortFilter.value = 'popular';
        
        // Show welcome message instead of loading all templates
        console.log('🎯 loadInitialData: Calling showWelcomeMessage...');
        showWelcomeMessage();
        console.log('🎯 loadInitialData: Welcome message displayed');
    } catch (error) {
        console.error('Error loading initial data:', error);
        resultsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-red-400 text-lg">Error loading workflows. Please refresh the page.</p>
            </div>
        `;
    }
}



// Event listeners for filters
let searchTimeout;
// Add search bar click handler for non-logged-in users
searchInput.addEventListener('focus', (e) => {
    if (!currentUser) {
        // Show a friendly sign-up prompt for non-logged-in users
        e.target.blur(); // Remove focus from search bar
        showSearchSignUpPrompt();
    }
});

// Handle Enter key press in search
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchTimeout);
        filterState.search = e.target.value.trim();
        applyFilters();
    }
});

searchInput.addEventListener('input', (e) => {
    console.log('Search input event triggered:', e.target.value);
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim();
    
    if (!searchTerm) {
        // Show welcome message when search is cleared
        welcomeScreenActive = true; // Re-enable welcome screen
        showWelcomeMessage();
        return;
    }
    
    searchTimeout = setTimeout(() => {
        console.log('Executing search for:', searchTerm);
        filterState.search = searchTerm;
        applyFilters();
    }, 300); // Debounce search input
});

sortFilter.addEventListener('change', (e) => {
    console.log('🔄 Sort changed to:', e.target.value);
    filterState.sort = e.target.value;
    applyFilters(); // Always apply filters when sort changes
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    loadInitialData();
});

// Also run immediately in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOM hasn't finished loading yet
} else {
    // DOM is ready
    console.log('DOM already ready, initializing app...');
    loadInitialData();
}

// Authentication event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Setting up authentication...');
    
    // Check if all required elements exist
    console.log('Login button:', loginBtn);
    console.log('Auth modal:', authModal);
    console.log('Supabase loaded:', !!window.supabase);
    console.log('Auth helpers loaded:', !!window.authHelpers);
    
    // Check for existing session
    if (window.authHelpers) {
        try {
            authHelpers.getCurrentUser().then(user => {
                console.log('Current user:', user);
                updateAuthUI(user);
            }).catch(error => {
                console.error('Error getting current user:', error);
                updateAuthUI(null); // Default to logged out state
            });
            
            // Listen for auth state changes
            authHelpers.onAuthChange((event, session) => {
                console.log('Auth state changed:', event, session);
                updateAuthUI(session?.user || null);
            });
        } catch (error) {
            console.error('Error setting up auth:', error);
            updateAuthUI(null);
        }
    } else {
        console.error('Auth helpers not loaded! Authentication features disabled.');
        updateAuthUI(null);
    }
    
    // Modal event listeners
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('Login button clicked!');
            showAuthModal(false);
        });
    } else {
        console.error('Login button not found!');
    }
    if (closeModal) {
        closeModal.addEventListener('click', hideAuthModal);
    }
    
    // Click outside modal to close
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
    
    // Toggle between login and signup
    toggleAuthMode.addEventListener('click', () => {
        const isCurrentlySignUp = document.getElementById('modalTitle').textContent === 'Sign Up';
        showAuthModal(!isCurrentlySignUp);
    });
    
    // Form submission
    authForm.addEventListener('submit', handleAuthSubmit);
    
    // Social login buttons
    googleSignInBtn.addEventListener('click', () => handleSocialLogin('google'));
    githubSignInBtn.addEventListener('click', () => handleSocialLogin('github'));
    
    // User menu dropdown
    userMenuBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // User dropdown menu event listeners
    logoutBtn.addEventListener('click', handleLogout);
    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        showProfileModal();
    });
    favoritesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showFavoritesModal();
    });
    historyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showHistoryModal();
    });
    
    // Save search to history when user searches
    const originalApplyFilters = applyFilters;
    window.applyFilters = async function() {
        await originalApplyFilters();
        
        // Save search to history if user is logged in and there's a search term
        if (currentUser && filterState.search.trim()) {
            try {
                await dbHelpers.saveSearch(currentUser.id, filterState.search.trim());
            } catch (error) {
                console.error('Error saving search history:', error);
            }
        }
    };
});

// Animated Background with YouTube Thumbnails
function createAnimatedBackground() {
    console.log('🎬 Starting createAnimatedBackground function');
    const animatedBg = document.getElementById('animatedBg');
    
    if (!animatedBg) {
        console.error('❌ animatedBg element not found!');
        return;
    } else {
        console.log('✅ animatedBg element found:', animatedBg);
    }
    
    // Sample YouTube thumbnail URLs - these will be replaced with real data
    let thumbnailUrls = [];
    
    // Function to extract YouTube thumbnails from loaded templates
    function extractThumbnailsFromTemplates() {
        if (allTemplates && allTemplates.length > 0) {
            thumbnailUrls = allTemplates
                .filter(template => template.Youtube_url)
                .map(template => {
                    const youtubeId = getYoutubeId(template.Youtube_url);
                    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;
                })
                .filter(url => url)
                .slice(0, 20); // Limit to 20 thumbnails for performance
        }
        
        // Always use some fallback thumbnails to ensure animation starts
        if (thumbnailUrls.length === 0) {
            thumbnailUrls = [
                'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
                'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
                'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
                'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
                'https://img.youtube.com/vi/Ct6BUPvE2sM/mqdefault.jpg',
                'https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg',
                'https://img.youtube.com/vi/ZZ5LpwO-An4/mqdefault.jpg',
                'https://img.youtube.com/vi/astISOttCQ0/mqdefault.jpg',
                'https://img.youtube.com/vi/3JZ_D3ELwOQ/mqdefault.jpg',
                'https://img.youtube.com/vi/2vjPBrBU-TM/mqdefault.jpg'
            ];
        }
        
        console.log('Thumbnails to use:', thumbnailUrls.length);
    }
    
    // Create floating thumbnail elements
    function createFloatingThumbnail(url, delay = 0) {
        try {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'floating-thumbnail';
            
            // Test image loading before setting background
            const testImg = new Image();
            testImg.onload = function() {
                thumbnail.style.backgroundImage = `url(${url})`;
            };
            testImg.onerror = function() {
                console.warn('⚠️ Failed to load thumbnail:', url);
                // Use a gradient background as fallback
                thumbnail.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
            };
            testImg.src = url;
            
            thumbnail.style.left = Math.random() * 90 + '%';
            thumbnail.style.animationDelay = `-${delay}s`;
            
            // Add slight rotation
            const rotation = (Math.random() - 0.5) * 30; // -15 to 15 degrees
            thumbnail.style.transform = `rotate(${rotation}deg)`;
            
            return thumbnail;
        } catch (error) {
            console.error('❌ Error creating floating thumbnail:', error);
            // Return empty div as fallback
            const fallback = document.createElement('div');
            fallback.className = 'floating-thumbnail';
            return fallback;
        }
    }
    
    // Initialize background animation
    function initializeBackground() {
        try {
            extractThumbnailsFromTemplates();
            
            console.log('🎬 Initializing background with', thumbnailUrls.length, 'thumbnails');
            
            if (!animatedBg) {
                console.error('❌ animatedBg element not found in initialization');
                return;
            }
            
            // Clear existing thumbnails safely
            while (animatedBg.firstChild) {
                animatedBg.removeChild(animatedBg.firstChild);
            }
            
            // Ensure we have thumbnails to work with
            if (thumbnailUrls.length === 0) {
                console.warn('⚠️ No thumbnails available, using fallback set');
                return;
            }
            
            // Create floating thumbnails immediately
            thumbnailUrls.forEach((url, index) => {
                try {
                    const delay = Math.random() * 5; // Shorter delay so they appear quickly
                    const thumbnail = createFloatingThumbnail(url, delay);
                    if (thumbnail && animatedBg) {
                        animatedBg.appendChild(thumbnail);
                        console.log('✅ Added thumbnail:', index);
                    }
                    
                    // Create multiple copies with different positions and delays
                    if (index < 5) {
                        setTimeout(() => {
                            try {
                                const copy = createFloatingThumbnail(url, Math.random() * 10);
                                if (copy && animatedBg) {
                                    copy.style.left = Math.random() * 90 + '%';
                                    animatedBg.appendChild(copy);
                                }
                            } catch (error) {
                                console.error('❌ Error creating thumbnail copy:', error);
                            }
                        }, Math.random() * 5000);
                    }
                } catch (error) {
                    console.error('❌ Error processing thumbnail:', error);
                }
            });
        } catch (error) {
            console.error('❌ Error in initializeBackground:', error);
        }
        
        // Periodically add new thumbnails
        setInterval(() => {
            if (thumbnailUrls.length > 0) {
                const randomUrl = thumbnailUrls[Math.floor(Math.random() * thumbnailUrls.length)];
                const newThumbnail = createFloatingThumbnail(randomUrl);
                animatedBg.appendChild(newThumbnail);
                
                // Remove old thumbnails to prevent memory leaks
                const existingThumbnails = animatedBg.querySelectorAll('.floating-thumbnail');
                if (existingThumbnails.length > 30) {
                    existingThumbnails[0].remove();
                }
            }
        }, 3000); // Add new thumbnail every 3 seconds
    }
    
    // Start background animation immediately with test thumbnails
    initializeBackground();
    
    // Re-initialize when templates are loaded
    const originalRenderCards = renderCards;
    window.renderCards = function(templates) {
        const result = originalRenderCards(templates);
        if (templates && templates.length > 0) {
            setTimeout(() => {
                extractThumbnailsFromTemplates();
            }, 1000);
        }
        return result;
    };
}

// Professional YouTube thumbnail animation
function createThumbnailAnimation() {
    console.log('🎬 Creating YouTube thumbnail animation');
    const animatedBg = document.getElementById('animatedBg');
    
    if (!animatedBg) {
        console.error('❌ No animatedBg element found');
        return;
    }
    
    let youtubeThumbnails = [];
    
    // Try to get real thumbnails from your Google Sheets template data
    if (window.allTemplates && window.allTemplates.length > 0) {
        console.log('📋 Using real Google Sheets template thumbnails');
        
        // Extract YouTube thumbnails from your actual template data
        const validTemplates = window.allTemplates.filter(template => 
            template.Youtube_url && 
            template.Youtube_url.trim() && 
            template.Youtube_url.includes('youtube.com') || template.Youtube_url.includes('youtu.be')
        );
        
        console.log(`Found ${validTemplates.length} templates with YouTube URLs`);
        
        youtubeThumbnails = validTemplates
            .map(template => {
                const youtubeId = getYoutubeId(template.Youtube_url);
                if (youtubeId) {
                    // Try maxresdefault first, then fallback to mqdefault
                    return {
                        high: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
                        medium: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
                        template: template
                    };
                }
                return null;
            })
            .filter(item => item)
            .slice(0, 20); // Use up to 20 real templates
            
        console.log(`✅ Extracted ${youtubeThumbnails.length} real thumbnails from Google Sheets`);
    }
    
    function waitForRealData() {
        console.log('⏳ Waiting for Google Sheets data to load creator thumbnails...');
        // Don't create any animation until real data is available
        return false;
    }
    
    // ONLY create animation if we have real Google Sheets data
    if (youtubeThumbnails.length > 0) {
        console.log(`🚀 Creating animation with ${youtubeThumbnails.length} REAL creator thumbnails from Google Sheets`);
        
        // Display creator names for reference
        const creators = [...new Set(youtubeThumbnails.map(t => t.template?.Creator).filter(c => c))];
        console.log('👥 Creators found:', creators.join(', '));
        
        // Create initial floating thumbnails from real data
        for (let i = 0; i < Math.min(10, youtubeThumbnails.length); i++) {
            const thumbnailData = youtubeThumbnails[i];
            createFloatingThumbnail(thumbnailData, i * 2);
        }
        
        // Add new thumbnails periodically using ONLY real creator data
        setInterval(() => {
            const randomThumbnailData = youtubeThumbnails[Math.floor(Math.random() * youtubeThumbnails.length)];
            createFloatingThumbnail(randomThumbnailData, 0);
            
            // Keep only 15 thumbnails max for performance
            const all = animatedBg.children;
            if (all.length > 15) {
                all[0].remove();
            }
        }, 3500);
    } else {
        console.log('⏳ No Google Sheets data available yet - waiting for real creator thumbnails...');
        // Don't show any animation until real data loads
    }
    
    function createFloatingThumbnail(thumbnailData, delay = 0) {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'floating-thumbnail';
        thumbnail.style.left = Math.random() * 80 + 10 + '%';
        
        // Add random animation delay and duration variation
        const randomDelay = delay + (Math.random() * 3);
        const randomDuration = 20 + (Math.random() * 15); // 20-35 seconds
        thumbnail.style.animationDelay = randomDelay + 's';
        thumbnail.style.animationDuration = randomDuration + 's';
        
        // Add slight random rotation and scale
        const rotation = (Math.random() - 0.5) * 12; // -6 to 6 degrees
        const scale = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15
        thumbnail.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        
        // Handle both new data structure and fallback strings
        let primaryUrl, fallbackUrl, templateInfo;
        
        if (typeof thumbnailData === 'object' && thumbnailData.high) {
            // New data structure with template info
            primaryUrl = thumbnailData.high;
            fallbackUrl = thumbnailData.medium;
            templateInfo = thumbnailData.template;
        } else {
            // Fallback string URL
            primaryUrl = thumbnailData;
            fallbackUrl = null;
        }
        
        // Create gradient background based on template creator if available
        let colors = ['#4ade80', '#22c55e', '#10b981', '#059669', '#047857'];
        if (templateInfo && templateInfo.Creator) {
            // Create unique colors based on creator name
            const hash = templateInfo.Creator.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
            const colorIndex = Math.abs(hash) % colors.length;
            colors = [colors[colorIndex], colors[(colorIndex + 1) % colors.length]];
        }
        thumbnail.style.background = `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`;
        
        // Try to load the high-quality image first
        const img = new Image();
        img.onload = function() {
            thumbnail.style.backgroundImage = `url(${primaryUrl})`;
            thumbnail.style.backgroundSize = 'cover';
            thumbnail.style.backgroundPosition = 'center';
            console.log('✅ High-quality thumbnail loaded:', templateInfo?.Name || 'Unknown');
        };
        img.onerror = function() {
            // Try fallback URL if available
            if (fallbackUrl) {
                const fallbackImg = new Image();
                fallbackImg.onload = function() {
                    thumbnail.style.backgroundImage = `url(${fallbackUrl})`;
                    thumbnail.style.backgroundSize = 'cover';
                    thumbnail.style.backgroundPosition = 'center';
                    console.log('✅ Fallback thumbnail loaded:', templateInfo?.Name || 'Unknown');
                };
                fallbackImg.onerror = function() {
                    createFallbackContent();
                };
                fallbackImg.src = fallbackUrl;
            } else {
                createFallbackContent();
            }
        };
        
        function createFallbackContent() {
            console.log(`⚠️ Image failed for: ${templateInfo?.Name || 'Unknown'} by ${templateInfo?.Creator || 'Unknown'}`);
            
            // Keep gradient and add creator info
            thumbnail.style.display = 'flex';
            thumbnail.style.flexDirection = 'column';
            thumbnail.style.alignItems = 'center';
            thumbnail.style.justifyContent = 'center';
            thumbnail.style.color = 'white';
            thumbnail.style.fontSize = '9px';
            thumbnail.style.fontWeight = 'bold';
            thumbnail.style.textAlign = 'center';
            thumbnail.style.padding = '4px';
            
            if (templateInfo && templateInfo.Creator) {
                thumbnail.innerHTML = `
                    <div style="font-size: 8px; opacity: 0.9;">${templateInfo.Creator}</div>
                    <div style="font-size: 6px; margin-top: 2px; opacity: 0.7; line-height: 1.2;">${templateInfo.Name?.substring(0, 20) || 'Template'}</div>
                `;
                console.log(`📦 Created fallback for ${templateInfo.Creator}: ${templateInfo.Name}`);
            } else {
                thumbnail.innerHTML = 'n8n<br>TEMPLATE';
            }
        }
        
        img.src = primaryUrl;
        animatedBg.appendChild(thumbnail);
    }
}

// Initialize animated background when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOM loaded, waiting for Google Sheets data with creator thumbnails');
    
    // Function to check for real Google Sheets data
    const checkForRealData = () => {
        if (window.allTemplates && window.allTemplates.length > 0) {
            const templatesWithYouTube = window.allTemplates.filter(template => 
                template.Youtube_url && 
                template.Youtube_url.trim() && 
                (template.Youtube_url.includes('youtube.com') || template.Youtube_url.includes('youtu.be'))
            );
            
            if (templatesWithYouTube.length > 0) {
                console.log(`✅ Found ${templatesWithYouTube.length} real templates with YouTube URLs from Google Sheets!`);
                console.log('🎯 Starting animation with ONLY real creator thumbnails');
                
                // Clear any existing animation
                const animatedBg = document.getElementById('animatedBg');
                if (animatedBg) {
                    animatedBg.innerHTML = '';
                }
                
                // Start animation with real data
                createThumbnailAnimation();
                return true;
            }
        }
        console.log('⏳ Still waiting for Google Sheets data with creator YouTube URLs...');
        return false;
    };
    
    // Check immediately in case data is already loaded
    if (!checkForRealData()) {
        // Check periodically until data is loaded
        const dataCheckInterval = setInterval(() => {
            if (checkForRealData()) {
                clearInterval(dataCheckInterval);
            }
        }, 2000);
        
        // Stop checking after 30 seconds
        setTimeout(() => {
            clearInterval(dataCheckInterval);
            console.log('⚠️ Timeout waiting for Google Sheets data');
        }, 30000);
    }

    // Modal Functions
    function showProfileModal() {
        console.log('🔍 Opening Profile Modal');
        console.log('Current User:', currentUser);
        
        const modal = document.getElementById('profileModal');
        const closeBtn = document.getElementById('closeProfileModal');
        
        if (!modal) {
            console.error('❌ Profile modal not found!');
            return;
        }
        
        if (currentUser) {
            // Populate profile information
            document.getElementById('profileAvatar').src = 
                currentUser.user_metadata?.avatar_url || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user_metadata?.full_name || currentUser.email)}&background=4ade80&color=000&size=128`;
            document.getElementById('profileName').textContent = 
                currentUser.user_metadata?.full_name || currentUser.email;
            document.getElementById('profileEmail').textContent = currentUser.email;
            document.getElementById('profileMemberSince').textContent = 
                new Date(currentUser.created_at).toLocaleDateString();
            
            // Load stats
            loadUserStats();
        } else {
            console.warn('⚠️ No current user found');
            // Show message for non-logged users
            document.getElementById('profileName').textContent = 'Not logged in';
            document.getElementById('profileEmail').textContent = 'Please log in to view profile';
            document.getElementById('profileMemberSince').textContent = '-';
            document.getElementById('profileFavoritesCount').textContent = '0';
            document.getElementById('profileSearchCount').textContent = '0';
            document.getElementById('profileAvatar').src = 'https://ui-avatars.com/api/?name=Guest&background=cccccc&color=666&size=128';
        }
        
        modal.classList.remove('hidden');
        
        // Close modal event listeners
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        
        // Remove any existing event listeners first
        closeBtn.removeEventListener('click', closeModal);
        modal.removeEventListener('click', closeModal);
        
        // Add new event listeners
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    function showFavoritesModal() {
        console.log('❤️ Opening Favorites Modal');
        console.log('Current User:', currentUser);
        
        const modal = document.getElementById('favoritesModal');
        const closeBtn = document.getElementById('closeFavoritesModal');
        const content = document.getElementById('favoritesContent');
        
        if (!modal || !content) {
            console.error('❌ Favorites modal elements not found!');
            return;
        }
        
        modal.classList.remove('hidden');
        
        // Load favorites
        if (currentUser) {
            loadUserFavorites(content);
        } else {
            content.innerHTML = `
                <div class="text-center py-8">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.682l-1.318-1.364a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        <h3 class="text-xl font-semibold text-white mb-2">No Favorites Yet</h3>
                        <p class="text-gray-400 mb-4">Please log in to save your favorite n8n templates!</p>
                        <button onclick="document.getElementById('loginBtn').click(); document.getElementById('favoritesModal').classList.add('hidden');" 
                                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Log In to Save Favorites
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Close modal event listeners
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    function showHistoryModal() {
        const modal = document.getElementById('historyModal');
        const closeBtn = document.getElementById('closeHistoryModal');
        const content = document.getElementById('historyContent');
        
        modal.classList.remove('hidden');
        
        // Load search history
        if (currentUser) {
            loadUserHistory(content);
        } else {
            content.innerHTML = `
                <div class="text-center py-8">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 class="text-xl font-semibold text-white mb-2">No Search History</h3>
                        <p class="text-gray-400 mb-4">Please log in to track your search history!</p>
                        <button onclick="document.getElementById('loginBtn').click(); document.getElementById('historyModal').classList.add('hidden');" 
                                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Log In to Track Searches
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Close modal event listeners
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    async function loadUserStats() {
        try {
            if (!currentUser) return;
            
            // Get favorites count
            const { count: favoritesCount } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);
            
            // Get search history count
            const { count: searchCount } = await supabase
                .from('search_history')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);
            
            document.getElementById('profileFavoritesCount').textContent = favoritesCount || 0;
            document.getElementById('profileSearchCount').textContent = searchCount || 0;
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    async function loadUserFavorites(container) {
        try {
            if (!currentUser) return;
            
            container.innerHTML = '<div class="text-center text-gray-400">Loading favorites...</div>';
            
            const { data: favorites, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (favorites.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.682l-1.318-1.364a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        <h3 class="text-xl font-semibold text-white mb-2">No Favorites Yet</h3>
                        <p class="text-gray-400 mb-4">Start favoriting templates you like by clicking the ❤️ on any template card!</p>
                        <button onclick="document.getElementById('favoritesModal').classList.add('hidden');" 
                                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Browse Templates
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = favorites.map(fav => `
                <div class="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <h3 class="font-semibold text-white mb-2">${fav.template_name}</h3>
                    <p class="text-gray-300 text-sm mb-3">${fav.template_description || 'No description available'}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-400">Added ${new Date(fav.created_at).toLocaleDateString()}</span>
                        <button onclick="removeFavorite('${fav.template_name}')" 
                                class="text-red-400 hover:text-red-300 text-sm">Remove</button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading favorites:', error);
            container.innerHTML = '<div class="text-center text-red-400">Error loading favorites</div>';
        }
    }

    async function loadUserHistory(container) {
        try {
            if (!currentUser) return;
            
            container.innerHTML = '<div class="text-center text-gray-400">Loading search history...</div>';
            
            const { data: searches, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('searched_at', { ascending: false })
                .limit(50);
            
            if (error) throw error;
            
            if (searches.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <h3 class="text-xl font-semibold text-white mb-2">No Search History</h3>
                        <p class="text-gray-400 mb-4">Your search history will appear here once you start searching for templates!</p>
                        <button onclick="document.getElementById('historyModal').classList.add('hidden'); document.getElementById('searchInput').focus();" 
                                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Start Searching
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = searches.map(search => `
                <div class="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-white font-medium">"${search.search_term}"</span>
                        </div>
                        <div class="text-xs text-gray-400">
                            ${new Date(search.searched_at).toLocaleDateString()}
                        </div>
                    </div>
                    <button onclick="repeatSearch('${search.search_term}')" 
                            class="text-green-400 hover:text-green-300 text-sm mt-2">
                        Search again
                    </button>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading search history:', error);
            container.innerHTML = '<div class="text-center text-red-400">Error loading search history</div>';
        }
    }

    // Helper functions for favorites and history
    window.removeFavorite = async function(templateId) {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('template_name', templateId);
            
            if (error) throw error;
            
            // Refresh the favorites display
            const content = document.getElementById('favoritesContent');
            loadUserFavorites(content);
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    window.repeatSearch = function(searchTerm) {
        // Close the history modal
        document.getElementById('historyModal').classList.add('hidden');
        
        // Set the search term and trigger search
        document.getElementById('searchInput').value = searchTerm;
        filterState.search = searchTerm;
        applyFilters();
    };
});
