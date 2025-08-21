// Messages Page JavaScript
// This file handles the messages page functionality with sample data
// Ready for Supabase integration later

// Placeholder for current user ID - will be replaced with Supabase auth
const currentUserId = 123;

// Sample conversations data - will be replaced with Supabase queries
const sampleConversations = [
    {
        id: 1,
        participant: "Ahmed Khan (Grade 10 Math)",
        lastMessage: "Thank you for the help with algebra!",
        timestamp: "2024-01-20T14:30:00",
        unreadCount: 2,
        avatar: "AK",
        isOnline: true
    },
    {
        id: 2,
        participant: "Fatima Rahman (Grade 8 English)",
        lastMessage: "When is our next session?",
        timestamp: "2024-01-20T12:15:00",
        unreadCount: 0,
        avatar: "FR",
        isOnline: false
    },
    {
        id: 3,
        participant: "Zara Ahmed (Grade 11 Physics)",
        lastMessage: "The thermodynamics explanation was perfect!",
        timestamp: "2024-01-19T16:45:00",
        unreadCount: 1,
        avatar: "ZA",
        isOnline: true
    },
    {
        id: 4,
        participant: "Rahim Ali (Grade 9 Chemistry)",
        lastMessage: "Can you explain organic compounds again?",
        timestamp: "2024-01-19T10:20:00",
        unreadCount: 0,
        avatar: "RA",
        isOnline: false
    },
    {
        id: 5,
        participant: "Sara Khan (Grade 12 Biology)",
        lastMessage: "Exam went great! Thanks for the preparation.",
        timestamp: "2024-01-18T18:30:00",
        unreadCount: 0,
        avatar: "SK",
        isOnline: false
    }
];

// Ensure a conversation exists between a tutor and a student
// Returns the conversation id. Uses Supabase conversations table with fallback to mock list.
async function ensureConversation(tutorId, studentId) {
    try {
        const supabase = window.getSupabaseClient && window.getSupabaseClient();
        if (supabase) {
            // Try to find existing
            const { data: existing, error: findErr } = await supabase
                .from('conversations')
                .select('*')
                .eq('tutor_id', tutorId)
                .eq('student_id', studentId)
                .limit(1)
                .maybeSingle();
            if (findErr && findErr.code !== 'PGRST116') throw findErr; // ignore no rows
            if (existing && existing.id) return existing.id;

            // Insert new conversation
            const { data: created, error: insertErr } = await supabase
                .from('conversations')
                .insert({ tutor_id: tutorId, student_id: studentId })
                .select('*')
                .single();
            if (insertErr) throw insertErr;
            return created.id;
        }
    } catch (err) {
        console.error('Error ensuring conversation in Supabase:', err);
    }
    // Fallback: create a mock conversation entry
    const id = Date.now();
    const participant = `Conversation ${id}`;
    sampleConversations.push({
        id,
        participant,
        lastMessage: '',
        timestamp: new Date().toISOString(),
        unreadCount: 0,
        avatar: 'CN',
        isOnline: false
    });
    return id;
}

// Sample messages for each conversation - will be replaced with Supabase queries
const sampleMessages = {
    1: [
        {
            id: 1,
            senderId: 123,
            content: "Hello Ahmed! How can I help you with math today?",
            timestamp: "2024-01-20T14:00:00",
            isRead: true
        },
        {
            id: 2,
            senderId: 101,
            content: "Hi! I'm struggling with quadratic equations.",
            timestamp: "2024-01-20T14:05:00",
            isRead: true
        },
        {
            id: 3,
            senderId: 123,
            content: "No problem! Let's start with the basics. Do you understand the standard form ax² + bx + c = 0?",
            timestamp: "2024-01-20T14:10:00",
            isRead: true
        },
        {
            id: 4,
            senderId: 101,
            content: "Yes, I understand that part.",
            timestamp: "2024-01-20T14:15:00",
            isRead: true
        },
        {
            id: 5,
            senderId: 123,
            content: "Great! Now let's solve x² + 5x + 6 = 0. Can you factor this?",
            timestamp: "2024-01-20T14:20:00",
            isRead: true
        },
        {
            id: 6,
            senderId: 101,
            content: "I think it's (x + 2)(x + 3) = 0",
            timestamp: "2024-01-20T14:25:00",
            isRead: true
        },
        {
            id: 7,
            senderId: 123,
            content: "Perfect! So x = -2 or x = -3. You're getting it!",
            timestamp: "2024-01-20T14:28:00",
            isRead: true
        },
        {
            id: 8,
            senderId: 101,
            content: "Thank you for the help with algebra!",
            timestamp: "2024-01-20T14:30:00",
            isRead: false
        }
    ],
    2: [
        {
            id: 9,
            senderId: 102,
            content: "Hi! When is our next session?",
            timestamp: "2024-01-20T12:15:00",
            isRead: true
        }
    ],
    3: [
        {
            id: 10,
            senderId: 103,
            content: "The thermodynamics explanation was perfect!",
            timestamp: "2024-01-19T16:45:00",
            isRead: false
        }
    ]
};

// Current active conversation
let activeConversationId = null;

// Badge update function
function updateBadges() {
    const totalUnread = sampleConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    
    const msgBadge = document.getElementById('badge-msg');
    if (msgBadge) {
        msgBadge.style.display = totalUnread > 0 ? 'block' : 'none';
    }

    // Update other badges (placeholder values for now)
    const appsBadge = document.getElementById('badge-apps');
    if (appsBadge) {
        appsBadge.textContent = '2';
    }

    const requestsBadge = document.getElementById('badge-requests');
    if (requestsBadge) {
        requestsBadge.textContent = '5';
    }

    const bellBadge = document.getElementById('badge-bell');
    if (bellBadge) {
        const totalNotifications = 2 + 5 + totalUnread; // +2 for apps, +5 for requests
        bellBadge.textContent = totalNotifications;
        bellBadge.style.display = totalNotifications > 0 ? 'flex' : 'none';
    }
}

// Render conversations list
function renderConversations() {
    const container = document.getElementById('conversation-list');
    if (!container) return;

    container.innerHTML = '';
    
    sampleConversations.forEach(conv => {
        const convItem = document.createElement('div');
        convItem.className = 'conversation-list';
        convItem.style.marginBottom = '0.5rem';
        
        const isActive = activeConversationId === conv.id;
        const activeClass = isActive ? 'active' : '';
        
        convItem.innerHTML = `
            <div class="dashboard-section ${activeClass}" style="cursor: pointer; transition: all 0.2s ease;" onclick="selectConversation(${conv.id})">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(90deg, #5ce1e6, #b8c1ec); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #232946; font-weight: bold; font-size: 0.9rem;">
                        ${conv.avatar}
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                            <strong style="color: #eaeaea;">${conv.participant}</strong>
                            <small style="color: #b8c1ec;">${formatTimestamp(conv.timestamp)}</small>
                        </div>
                        <p style="color: #b8c1ec; margin: 0; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${conv.lastMessage}
                        </p>
                    </div>
                    ${conv.unreadCount > 0 ? `<span class="badge">${conv.unreadCount}</span>` : ''}
                    <div style="width: 8px; height: 8px; background: ${conv.isOnline ? '#34c759' : '#b8c1ec'}; border-radius: 50%;"></div>
                </div>
            </div>
        `;
        
        container.appendChild(convItem);
    });
}

// Select conversation
function selectConversation(conversationId) {
    activeConversationId = conversationId;
    
    // Update active state in conversations list
    renderConversations();
    
    // Load and display messages
    loadMessages(conversationId);
    
    // Show message form
    const messageForm = document.getElementById('send-message-form');
    if (messageForm) {
        messageForm.style.display = 'flex';
    }
}

// Fetch messages from Supabase with fallback to mock
async function fetchMessages(conversationId) {
    try {
        const supabase = window.getSupabaseClient && window.getSupabaseClient();
        if (supabase) {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return (data || []).map(m => ({
                id: m.id,
                senderId: m.sender_id ?? m.senderId,
                content: m.content ?? m.text,
                timestamp: m.created_at ?? m.timestamp,
                isRead: typeof m.is_read === 'boolean' ? m.is_read : true
            }));
        }
    } catch (err) {
        console.error('Error fetching messages from Supabase:', err);
    }
    // Fallback to mock
    return sampleMessages[conversationId] || [];
}

// Load messages for a conversation
async function loadMessages(conversationId) {
    const messages = await fetchMessages(conversationId);
    const conversation = sampleConversations.find(c => c.id === conversationId);
    
    // Update chat header
    const chatHeader = document.getElementById('chat-header');
    if (chatHeader && conversation) {
        chatHeader.innerHTML = `
            <h3 style="color: #5ce1e6; margin: 0;">
                <i class="fas fa-user"></i> ${conversation.participant}
                <span style="font-size: 0.8rem; color: #b8c1ec; margin-left: 1rem;">
                    ${conversation.isOnline ? '🟢 Online' : '⚪ Offline'}
                </span>
            </h3>
        `;
    }
    
    // Render messages
    renderMessages(messages);
    
    // Mark messages as read
    markMessagesAsRead(conversationId);
}

// Render messages
function renderMessages(messages) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #b8c1ec; opacity: 0.7;">
                <i class="fas fa-comment" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.senderId === currentUserId ? 'sent' : 'received'}`;
        
        // Add report button for received messages (from other users)
        const reportButton = message.senderId !== currentUserId ? 
            `<button class="report-btn message-report-btn" 
                     data-reported-user="${message.senderId}" 
                     data-content-id="${message.id}" 
                     title="Report this message">
                <i class="fas fa-flag"></i>
             </button>` : '';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div style="margin-bottom: 0.5rem;">
                    ${message.content}
                </div>
                <div class="message-footer">
                    <small style="opacity: 0.7; font-size: 0.8rem;">
                        ${formatTimestamp(message.timestamp)}
                        ${message.senderId === currentUserId ? '✓' : ''}
                    </small>
                    ${reportButton}
                </div>
            </div>
        `;
        
        container.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Mark messages as read
function markMessagesAsRead(conversationId) {
    // Update unread count in conversations
    const conversation = sampleConversations.find(c => c.id === conversationId);
    if (conversation) {
        conversation.unreadCount = 0;
        renderConversations();
        updateBadges();
    }
    
    // TODO: Update messages as read in Supabase
    // const { data, error } = await supabase
    //     .from("messages")
    //     .update({ is_read: true })
    //     .eq("conversation_id", conversationId)
    //     .eq("recipient_id", currentUserId);
}

// Send a message via Supabase with fallback to mock
async function sendMessage(conversationId, senderId, text) {
    try {
        const supabase = window.getSupabaseClient && window.getSupabaseClient();
        if (supabase) {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: senderId,
                    content: text
                })
                .select('*')
                .single();
            if (error) throw error;
            return {
                id: data.id,
                senderId: data.sender_id ?? senderId,
                content: data.content ?? text,
                timestamp: data.created_at ?? new Date().toISOString(),
                isRead: typeof data.is_read === 'boolean' ? data.is_read : true
            };
        }
    } catch (err) {
        console.error('Error inserting message into Supabase:', err);
    }
    // Fallback to mock: store and return the created message
    const fallback = {
        id: Date.now(),
        senderId,
        content: text,
        timestamp: new Date().toISOString(),
        isRead: false
    };
    if (!sampleMessages[conversationId]) sampleMessages[conversationId] = [];
    sampleMessages[conversationId].push(fallback);
    return fallback;
}

// UI handler: Send message from form
async function handleSendMessage(event) {
    event.preventDefault();
    
    if (!activeConversationId) return;
    
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    // Send via Supabase (with fallback internally)
    await sendMessage(activeConversationId, currentUserId, content);
    
    // Update conversation last message
    const conversation = sampleConversations.find(c => c.id === activeConversationId);
    if (conversation) {
        conversation.lastMessage = content;
        conversation.timestamp = new Date().toISOString();
        renderConversations();
    }
    
    // Re-fetch and render messages
    const updated = await fetchMessages(activeConversationId);
    renderMessages(updated);
    
    // Clear input
    messageInput.value = '';
    
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
}

// Supabase integration placeholders
async function loadConversationsFromSupabase() {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //     .from("conversations")
    //     .select(`
    //         *,
    //         participants (
    //             id,
    //             name,
    //             avatar
    //         )
    //     `)
    //     .contains("participants", [currentUserId])
    //     .order("updated_at", { ascending: false });
    
    // if (error) {
    //     console.error("Error loading conversations:", error);
    //     return [];
    // }
    
    // return data;
    return sampleConversations;
}

async function loadMessagesFromSupabase(conversationId) {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //     .from("messages")
    //     .select("*")
    //     .eq("conversation_id", conversationId)
    //     .order("timestamp", { ascending: true });
    
    // if (error) {
    //     console.error("Error loading messages:", error);
    //     return [];
    // }
    
    // return data;
    return sampleMessages[conversationId] || [];
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Messages page initialized');
    
    // Update badges
    updateBadges();
    
    // Render conversations
    renderConversations();
    
    // Add message form event listener
    const messageForm = document.getElementById('send-message-form');
    if (messageForm) {
        messageForm.addEventListener('submit', handleSendMessage);
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
window.messagesPage = {
    renderConversations,
    selectConversation,
    loadMessages,
    sendMessage,
    fetchMessages,
    handleSendMessage,
    ensureConversation,
    loadConversationsFromSupabase,
    loadMessagesFromSupabase,
    updateBadges
};
