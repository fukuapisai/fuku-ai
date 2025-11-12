// State Management
let chatState = {
    messages: [],
    isTyping: false
};

// DOM Elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    autoResizeTextarea();
});

// Event Listeners
function setupEventListeners() {
    messageInput.addEventListener('input', () => {
        sendBtn.disabled = !messageInput.value.trim();
        autoResizeTextarea();
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    sendBtn.addEventListener('click', handleSendMessage);
    newChatBtn.addEventListener('click', handleNewChat);

    // Suggestion cards
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.dataset.prompt;
            messageInput.value = prompt;
            sendBtn.disabled = false;
            handleSendMessage();
        });
    });
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
}

// Handle Send Message
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message || chatState.isTyping) return;

    // Hide welcome screen
    welcomeScreen.style.display = 'none';

    // Add user message
    addMessage('user', message);
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Show typing indicator
    showTypingIndicator();

    // Send to API
    try {
        const response = await sendToAPI(message);
        removeTypingIndicator();
        addMessage('assistant', response);
        
        // Update chat history
        updateChatHistory(message);
    } catch (error) {
        removeTypingIndicator();
        addMessage('assistant', 'Maaf, terjadi kesalahan. Silakan coba lagi.');
        console.error('Error:', error);
    }
}

// Send to API
async function sendToAPI(message) {
    chatState.isTyping = true;
    
    const encodedText = encodeURIComponent(message);
    const systemPrompt = encodeURIComponent('Nama kamu adalah Fukushima yang di ciptakan oleh AhmadXyz');
    
    const response = await fetch(`/api/ai?text=${encodedText}&systemPrompt=${systemPrompt}`);
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    const data = await response.json();
    chatState.isTyping = false;
    
    if (data.success) {
        return data.result;
    } else {
        throw new Error('API returned error');
    }
}

// Add Message to Chat
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = role === 'user' ? 'U' : 'F';
    const roleName = role === 'user' ? 'Anda' : 'Fukushima';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">${avatar}</div>
            <span class="message-role">${roleName}</span>
        </div>
        <div class="message-content">
            ${formatMessage(content)}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    
    // Save to state
    chatState.messages.push({ role, content });
}

// Format Message (simple markdown-like formatting)
function formatMessage(text) {
    // Convert line breaks to <p> tags
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => {
        // Bold text
        p = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic text
        p = p.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Code inline
        p = p.replace(/`(.*?)`/g, '<code>$1</code>');
        return `<p>${p}</p>`;
    }).join('');
}

// Typing Indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">F</div>
            <span class="message-role">Fukushima</span>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Scroll to Bottom
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Handle New Chat
function handleNewChat() {
    chatState.messages = [];
    messagesContainer.innerHTML = '';
    welcomeScreen.style.display = 'flex';
    messageInput.value = '';
    sendBtn.disabled = true;
}

// Update Chat History
function updateChatHistory(firstMessage) {
    const existingChat = document.querySelector('.chat-item.active');
    if (!existingChat) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item active';
        chatItem.textContent = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
        chatHistory.insertBefore(chatItem, chatHistory.firstChild);
    }
}