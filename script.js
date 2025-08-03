// Global variables
let currentChatId = null;
let chatHistory = [];
let isTyping = false;
let sessionStartTime = new Date();
let isLoggedIn = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    setupEventListeners();
    startTimeUpdate();
    
    // Check if user is already logged in
    const savedLogin = localStorage.getItem('bean_stash_login');
    if (savedLogin) {
        isLoggedIn = true;
        hideLoginModal();
        showMainInterface();
    }
    
    // Add click event for album art play overlay
    const playOverlay = document.getElementById('playOverlay');
    if (playOverlay) {
        playOverlay.addEventListener('click', togglePlayPause);
    }
    
    // Load theme and request notification permission
    loadTheme();
    requestNotificationPermission();
});

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple demo login - accept any non-empty credentials
    if (username.trim() && password.trim()) {
        isLoggedIn = true;
        localStorage.setItem('bean_stash_login', 'true');
        hideLoginModal();
        showMainInterface();
        
        // Show welcome message
        setTimeout(() => {
            addMessageToChat('assistant', `Welcome back, ${username}! 🎵 I've enabled the music player for you. Click the music button in the header to start listening to some tunes while we chat!`);
        }, 500);
    } else {
        alert('Please enter both username and password');
    }
}

// Hide login modal
function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Show main interface
function showMainInterface() {
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'flex';
    }
    
    // Focus the input field
    focusInput();
}

// Setup event listeners
function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.querySelector('.send-btn');
    
    // Auto-resize input
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Handle Enter key
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Focus input on click
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.sidebar') && !e.target.closest('.modal')) {
            focusInput();
        }
    });
}

// Focus the input field
function focusInput() {
    const messageInput = document.getElementById('messageInput');
    messageInput.focus();
}

// Handle key press for Enter key
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send message function
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || isTyping) return;
    
    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Create new chat if none exists
    if (!currentChatId) {
        currentChatId = generateChatId();
        addChatToHistory(currentChatId, message.substring(0, 30) + '...');
    }
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Call Hack Club AI API
        const response = await fetch('https://ai.hackclub.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are Bean Stash, a friendly and helpful AI assistant. You have a warm, conversational personality and love to help users with their questions. Keep responses concise but informative.'
                    },
                    ...chatHistory.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    {
                        role: 'user',
                        content: message
                    }
                ],
                model: 'gpt-3.5-turbo',
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add assistant response to chat
        const assistantMessage = data.choices[0].message.content;
        addMessageToChat('assistant', assistantMessage);
        
        // Update chat history in sidebar
        updateChatHistoryTitle(currentChatId, message.substring(0, 30) + '...');
        
    } catch (error) {
        console.error('Error calling AI API:', error);
        hideTypingIndicator();
        
        // Show error message
        addMessageToChat('assistant', 'Sorry, I encountered an error while processing your request. Please try again later.');
    }
}

// Add message to chat
function addMessageToChat(role, content) {
    const chatContainer = document.getElementById('chatContainer');
    
    // Remove welcome message if it exists
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-coffee"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Format the content with proper line breaks and formatting
    const formattedContent = formatMessage(content);
    messageContent.innerHTML = formattedContent;
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
    });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timestamp);
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Store in chat history
    chatHistory.push({ role, content });
    saveChatHistory();
}

// Show typing indicator
function showTypingIndicator() {
    const chatContainer = document.getElementById('chatContainer');
    isTyping = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-coffee"></i>';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    typingContent.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingContent);
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isTyping = false;
}

// Generate unique chat ID
function generateChatId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Add chat to history sidebar
function addChatToHistory(chatId, title) {
    const chatHistoryContainer = document.getElementById('chatHistory');
    
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-history-item';
    chatItem.setAttribute('data-chat-id', chatId);
    chatItem.textContent = title;
    chatItem.onclick = () => loadChat(chatId);
    
    chatHistoryContainer.appendChild(chatItem);
    
    // Set as active
    setActiveChat(chatId);
}

// Set active chat in sidebar
function setActiveChat(chatId) {
    // Remove active class from all items
    document.querySelectorAll('.chat-history-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current chat
    const activeItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Load chat from history
function loadChat(chatId) {
    // This would load the chat from localStorage
    // For now, we'll just set the current chat ID
    currentChatId = chatId;
    setActiveChat(chatId);
    
    // Clear current chat display
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="fas fa-coffee"></i>
            </div>
            <h2>Welcome to Bean Stash!</h2>
            <p>Your friendly AI assistant powered by Hack Club AI. Ask me anything!</p>
        </div>
    `;
    
    // Load chat messages from localStorage
    const savedChat = localStorage.getItem(`chat_${chatId}`);
    if (savedChat) {
        const messages = JSON.parse(savedChat);
        chatHistory = messages;
        
        // Display messages
        messages.forEach(msg => {
            addMessageToChat(msg.role, msg.content);
        });
    } else {
        chatHistory = [];
    }
}

// Start new chat
function startNewChat() {
    currentChatId = null;
    chatHistory = [];
    
    // Clear chat display
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="fas fa-coffee"></i>
            </div>
            <h2>Welcome to Bean Stash!</h2>
            <p>Your friendly AI assistant powered by Hack Club AI. Ask me anything!</p>
        </div>
    `;
    
    // Remove active class from all items
    document.querySelectorAll('.chat-history-item').forEach(item => {
        item.classList.remove('active');
    });
    
    focusInput();
}

// Update chat history title
function updateChatHistoryTitle(chatId, title) {
    const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (chatItem) {
        chatItem.textContent = title;
    }
}

// Save chat history to localStorage
function saveChatHistory() {
    if (currentChatId) {
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatHistory));
    }
}

// Load chat history from localStorage
function loadChatHistory() {
    // This would load all chat history items
    // For now, we'll just show a placeholder
    const chatHistoryContainer = document.getElementById('chatHistory');
    chatHistoryContainer.innerHTML = `
        <div style="text-align: center; opacity: 0.7; font-size: 12px; padding: 20px;">
            Start a new conversation to see your chat history here
        </div>
    `;
}

// Clear chat history
function clearChatHistory() {
    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
        // Clear localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('chat_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear sidebar
        const chatHistoryContainer = document.getElementById('chatHistory');
        chatHistoryContainer.innerHTML = `
            <div style="text-align: center; opacity: 0.7; font-size: 12px; padding: 20px;">
                Start a new conversation to see your chat history here
            </div>
        `;
        
        // Start new chat
        startNewChat();
        
        // Close settings modal
        toggleSettings();
    }
}

// Toggle settings modal
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('active');
    
    if (modal.classList.contains('active')) {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    } else {
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Logout function
function logout() {
    isLoggedIn = false;
    localStorage.removeItem('bean_stash_login');
    
    // Hide main interface
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'none';
    }
    
    // Show login modal
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Stop music if playing
    if (currentAudio && isPlaying) {
        currentAudio.pause();
        isPlaying = false;
        updatePlayButton();
    }
    
    // Hide music player
    const musicSection = document.getElementById('musicPlayerSection');
    if (musicSection) {
        musicSection.style.display = 'none';
    }
    
    // Reset music button
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.classList.remove('active');
    }
    
    // Close settings modal
    toggleSettings();
}

// Change theme
function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    const theme = themeSelect.value;
    
    // Remove existing theme classes
    document.body.classList.remove('theme-dark', 'theme-light');
    
    // Add new theme class
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        const themeSelect = document.getElementById('themeSelect');
        themeSelect.value = savedTheme;
        changeTheme();
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('settingsModal');
    if (e.target === modal) {
        toggleSettings();
    }
});

// Format message content with proper line breaks and formatting
function formatMessage(content) {
    if (!content) return '';
    
    // Replace line breaks with <br> tags
    let formatted = content.replace(/\n/g, '<br>');
    
    // Handle inline math expressions ($...$)
    formatted = formatted.replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>');
    
    // Handle display math expressions ($$...$$)
    formatted = formatted.replace(/\$\$([^$]+)\$\$/g, '<div class="math-display">$1</div>');
    
    // Handle code blocks (text between backticks)
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle bold text (text between **)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text (text between *)
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle bullet points and lists
    formatted = formatted.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Handle numbered lists
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Handle multiple consecutive line breaks
    formatted = formatted.replace(/<br><br><br>/g, '<br><br>');
    
    // Handle special characters for math
    formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>');
    formatted = formatted.replace(/\\sqrt\{([^}]+)\}/g, '<span class="sqrt">√<span class="radicand">$1</span></span>');
    formatted = formatted.replace(/\\sum/g, '<span class="math-symbol">∑</span>');
    formatted = formatted.replace(/\\int/g, '<span class="math-symbol">∫</span>');
    formatted = formatted.replace(/\\pi/g, '<span class="math-symbol">π</span>');
    formatted = formatted.replace(/\\theta/g, '<span class="math-symbol">θ</span>');
    formatted = formatted.replace(/\\alpha/g, '<span class="math-symbol">α</span>');
    formatted = formatted.replace(/\\beta/g, '<span class="math-symbol">β</span>');
    formatted = formatted.replace(/\\gamma/g, '<span class="math-symbol">γ</span>');
    formatted = formatted.replace(/\\delta/g, '<span class="math-symbol">δ</span>');
    formatted = formatted.replace(/\\infty/g, '<span class="math-symbol">∞</span>');
    
    return formatted;
}

// Time update functions
function startTimeUpdate() {
    updateTime();
    // Update time every second
    setInterval(updateTime, 1000);
}

function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        // Calculate session duration
        const sessionDuration = Math.floor((now - sessionStartTime) / 1000 / 60); // minutes
        const sessionText = sessionDuration > 0 ? ` • ${sessionDuration}m session` : '';
        
        timeElement.innerHTML = `${timeString} • ${dateString}${sessionText}`;
    }
}

// Spotify Integration
let spotifyAccessToken = null;
let spotifyPlayer = null;

function toggleSpotify() {
    const panel = document.getElementById('spotifyPanel');
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function connectSpotify() {
    // Check if we already have an access token stored
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
        spotifyAccessToken = storedToken;
        initializeSpotifyPlayer();
        showSpotifyPlayer();
        return;
    }
    
    // Check if we have a token from URL (OAuth callback)
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    
    if (accessToken) {
        // We have a token, initialize Spotify
        spotifyAccessToken = accessToken;
        localStorage.setItem('spotify_access_token', accessToken);
        initializeSpotifyPlayer();
        showSpotifyPlayer();
        return;
    }
    
    // For demo purposes, show the player interface without OAuth
    // This avoids the OAuth issues and provides a working demo
    showSpotifyPlayer();
    
    // Note: For production use, you would need to:
    // 1. Register your app with Spotify Developer Dashboard
    // 2. Use proper OAuth flow with response_type=code
    // 3. Implement server-side token exchange
    // 4. Use Spotify Web Playback SDK
    
    console.log('Spotify demo mode activated - showing mock player interface');
}

function initializeSpotifyPlayer() {
    if (!spotifyAccessToken) return;
    
    // For demo purposes, show a mock player
    showSpotifyPlayer();
    
    // In a real implementation, you would:
    // 1. Load the Spotify Web Playback SDK
    // 2. Initialize the player with the access token
    // 3. Set up event listeners for playback state changes
}

function showSpotifyPlayer() {
    document.getElementById('spotifyLogin').style.display = 'none';
    document.getElementById('spotifyPlayer').style.display = 'block';
    
    // Show demo track info with better messaging
    document.getElementById('trackName').textContent = 'Demo Mode - Bean Stash';
    document.getElementById('artistName').textContent = 'Music Player Demo';
    document.getElementById('albumArt').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMURCODU0Ii8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI4IiBmaWxsPSIjMURCODU0Ii8+Cjwvc3ZnPgo=';
    
    // Add a small note about demo mode
    const trackInfo = document.querySelector('.track-info');
    if (trackInfo) {
        const demoNote = document.createElement('div');
        demoNote.style.fontSize = '12px';
        demoNote.style.color = '#1DB954';
        demoNote.style.marginTop = '5px';
        demoNote.textContent = 'Demo mode - Use main music player for full features';
        trackInfo.appendChild(demoNote);
    }
}

function spotifyPlayPause() {
    // Toggle play/pause button icon
    const btn = document.getElementById('playPauseBtn');
    const icon = btn.querySelector('i');
    if (icon.classList.contains('fa-play')) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        document.getElementById('trackName').textContent = 'Now Playing - Bean Stash';
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        document.getElementById('trackName').textContent = 'Paused - Bean Stash';
    }
}

function spotifyPrevious() {
    document.getElementById('trackName').textContent = 'Previous Track - Bean Stash';
    document.getElementById('artistName').textContent = 'Hack Club AI';
}

function spotifyNext() {
    document.getElementById('trackName').textContent = 'Next Track - Bean Stash';
    document.getElementById('artistName').textContent = 'Hack Club AI';
}

function spotifyVolume(value) {
    // Update volume display
    const volumeDisplay = document.querySelector('.volume-control');
    if (value > 50) {
        volumeDisplay.innerHTML = '<i class="fas fa-volume-up"></i><input type="range" id="volumeSlider" min="0" max="100" value="' + value + '" onchange="spotifyVolume(this.value)"><i class="fas fa-volume-up"></i>';
    } else if (value > 0) {
        volumeDisplay.innerHTML = '<i class="fas fa-volume-down"></i><input type="range" id="volumeSlider" min="0" max="100" value="' + value + '" onchange="spotifyVolume(this.value)"><i class="fas fa-volume-down"></i>';
    } else {
        volumeDisplay.innerHTML = '<i class="fas fa-volume-mute"></i><input type="range" id="volumeSlider" min="0" max="100" value="' + value + '" onchange="spotifyVolume(this.value)"><i class="fas fa-volume-mute"></i>';
    }
}

// Study Timer
let timerInterval = null;
let timerTime = 25 * 60; // 25 minutes in seconds
let timerRunning = false;

function toggleStudyTimer() {
    const modal = document.getElementById('studyTimerModal');
    modal.classList.toggle('active');
    
    if (modal.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        document.getElementById('startTimerBtn').style.display = 'none';
        document.getElementById('pauseTimerBtn').style.display = 'inline-block';
        document.getElementById('timerStatus').textContent = 'Timer running...';
        
        timerInterval = setInterval(() => {
            timerTime--;
            updateTimerDisplay();
            
            if (timerTime <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                document.getElementById('timerStatus').textContent = 'Time\'s up!';
                document.getElementById('startTimerBtn').style.display = 'inline-block';
                document.getElementById('pauseTimerBtn').style.display = 'none';
                
                // Show notification
                if (Notification.permission === 'granted') {
                    new Notification('Bean Stash Timer', {
                        body: 'Your study session is complete!',
                        icon: '/favicon.ico'
                    });
                }
                
                // Play sound
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
                audio.play();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        document.getElementById('startTimerBtn').style.display = 'inline-block';
        document.getElementById('pauseTimerBtn').style.display = 'none';
        document.getElementById('timerStatus').textContent = 'Timer paused';
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerTime = 25 * 60;
    updateTimerDisplay();
    document.getElementById('startTimerBtn').style.display = 'inline-block';
    document.getElementById('pauseTimerBtn').style.display = 'none';
    document.getElementById('timerStatus').textContent = 'Ready to start';
}

function setTimer(minutes) {
    timerTime = minutes * 60;
    updateTimerDisplay();
    document.getElementById('customTime').value = minutes;
}

function setCustomTimer() {
    const minutes = parseInt(document.getElementById('customTime').value);
    if (minutes > 0 && minutes <= 120) {
        setTimer(minutes);
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Fullscreen functionality
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}

// Music Player Functionality
let currentAudio = null;
let isPlaying = false;
let currentTrackIndex = 0;
let isMusicPlayerVisible = false;
let isLyricsCollapsed = false;

// Sample music data with lyrics
const musicLibrary = [
    {
        title: "Bean Stash Theme",
        artist: "Hack Club AI",
        albumArt: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNkQ1OTY0Ii8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIxMCIgZmlsbD0iIzZENjk2NCIvPgo8L3N2Zz4K",
        audioUrl: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
        lyrics: "Welcome to Bean Stash\nYour friendly AI assistant\nPowered by Hack Club AI\nAsk me anything you want to know\n\nI'm here to help you learn\nAnd make your day a little better\nSo let's start chatting\nAnd see where our conversation goes"
    },
    {
        title: "Coffee Break",
        artist: "Bean Stash",
        albumArt: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjQUE5NDk2Ii8+CjxwYXRoIGQ9Ik0yMCAyMGg0MHY0MEgyMHoiIGZpbGw9IiNFRkE5OTAiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iOCIgZmlsbD0iIzZENjk2NCIvPgo8L3N2Zz4K",
        audioUrl: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
        lyrics: "Time for a coffee break\nTake a moment to relax\nLet your mind wander\nAnd enjoy this peaceful time\n\nBrew yourself a cup\nOf your favorite blend\nAnd let the aroma\nFill your senses with joy"
    },
    {
        title: "Study Session",
        artist: "Bean Stash",
        albumArt: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNkQ1OTY0Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMzAgMzBoMjB2M0gzMHoiIGZpbGw9IiM2RDY5NjQiLz4KPC9zdmc+Cg==",
        audioUrl: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
        lyrics: "Focus on your studies\nLet knowledge flow through you\nEvery page you turn\nBrings you closer to your goals\n\nStay determined and strong\nYour future is bright ahead\nKeep learning and growing\nYou're doing amazing things"
    }
];

// Toggle music player visibility
function toggleMusicPlayer() {
    const musicSection = document.getElementById('musicPlayerSection');
    const musicBtn = document.getElementById('musicBtn');
    
    isMusicPlayerVisible = !isMusicPlayerVisible;
    
    if (isMusicPlayerVisible) {
        musicSection.style.display = 'block';
        musicBtn.classList.add('active');
        loadCurrentTrack();
    } else {
        musicSection.style.display = 'none';
        musicBtn.classList.remove('active');
        if (currentAudio) {
            currentAudio.pause();
            isPlaying = false;
            updatePlayButton();
        }
    }
}

// Load current track
function loadCurrentTrack() {
    const track = musicLibrary[currentTrackIndex];
    
    document.getElementById('musicTrackName').textContent = track.title;
    document.getElementById('musicArtistName').textContent = track.artist;
    document.getElementById('musicAlbumArt').src = track.albumArt;
    document.getElementById('currentLyrics').textContent = track.lyrics;
    
    // Create audio element
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    currentAudio = new Audio(track.audioUrl);
    currentAudio.volume = document.getElementById('mainVolumeSlider').value / 100;
    
    // Set up audio event listeners
    currentAudio.addEventListener('loadedmetadata', function() {
        document.getElementById('totalTimeDisplay').textContent = formatTime(currentAudio.duration);
    });
    
    currentAudio.addEventListener('timeupdate', function() {
        const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('currentTimeDisplay').textContent = formatTime(currentAudio.currentTime);
    });
    
    currentAudio.addEventListener('ended', function() {
        nextTrack();
    });
    
    isPlaying = false;
    updatePlayButton();
}

// Toggle play/pause
function togglePlayPause() {
    if (!currentAudio) return;
    
    if (isPlaying) {
        currentAudio.pause();
        isPlaying = false;
    } else {
        currentAudio.play();
        isPlaying = true;
    }
    
    updatePlayButton();
}

// Update play button icon
function updatePlayButton() {
    const playBtn = document.getElementById('mainPlayBtn');
    const playOverlay = document.getElementById('playOverlay');
    const icon = playBtn.querySelector('i');
    const overlayIcon = playOverlay.querySelector('i');
    
    if (isPlaying) {
        icon.className = 'fas fa-pause';
        overlayIcon.className = 'fas fa-pause';
    } else {
        icon.className = 'fas fa-play';
        overlayIcon.className = 'fas fa-play';
    }
}

// Previous track
function previousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + musicLibrary.length) % musicLibrary.length;
    loadCurrentTrack();
    if (isPlaying) {
        currentAudio.play();
    }
}

// Next track
function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicLibrary.length;
    loadCurrentTrack();
    if (isPlaying) {
        currentAudio.play();
    }
}

// Set volume
function setVolume(value) {
    if (currentAudio) {
        currentAudio.volume = value / 100;
    }
}

// Toggle lyrics visibility
function toggleLyrics() {
    const lyricsContent = document.getElementById('lyricsContent');
    const toggleBtn = document.getElementById('toggleLyricsBtn');
    const icon = toggleBtn.querySelector('i');
    
    isLyricsCollapsed = !isLyricsCollapsed;
    
    if (isLyricsCollapsed) {
        lyricsContent.classList.add('collapsed');
        icon.className = 'fas fa-chevron-down';
    } else {
        lyricsContent.classList.remove('collapsed');
        icon.className = 'fas fa-chevron-up';
    }
}

// Format time for display
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Initialize music player when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add click event for album art play overlay
    document.getElementById('playOverlay').addEventListener('click', togglePlayPause);
    
    // Load theme and request notification permission
    loadTheme();
    requestNotificationPermission();
}); 