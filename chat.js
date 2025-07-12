document.addEventListener('DOMContentLoaded', () => {
            // WebSocket setup
            let socket;
            let reconnectAttempts = 0;
            const maxReconnectAttempts = 5;
            const reconnectDelay = 3000;
            
            // DOM Elements
            const messageInput = document.getElementById('message-input');
            const sendButton = document.getElementById('send-button');
            const messagesContainer = document.getElementById('messages');
            const connectionStatus = document.getElementById('connection-status');
            const typingIndicator = document.getElementById('typing-indicator');
            const userCountElement = document.getElementById('user-count');
            
            // User state
            let currentUsername = `User${Math.floor(Math.random() * 1000)}`;
            let isTyping = false;
            let lastTypingTime = 0;
            
            // Typing timeout (in milliseconds)
            const typingTimeout = 2000;
            
            // Connect to WebSocket server
            function connect() {
                // In a real app, this would connect to your WebSocket server
                // For this demo, we'll simulate the WebSocket behavior
                console.log('Connecting to WebSocket server...');
                
                simulateConnection();
                
                // Enable UI elements
                sendButton.disabled = false;
                messageInput.disabled = false;
                
                // Update connection status
                updateConnectionStatus('Connected', 'bg-green-500');
                
                // Mock user count update
                updateUserCount(Math.floor(Math.random() * 10) + 1);
            }
            
            // Simulate WebSocket connection (in a real app, you'd connect to an actual WebSocket server)
            function simulateConnection() {
                socket = {
                    send: function(message) {
                        console.log('Sending message:', message);
                        // Simulate receiving messages
                        setTimeout(() => {
                            const data = JSON.parse(message);
                            
                            if (data.type === 'message') {
                                // Simulate other users seeing the message
                                const responseData = {
                                    type: 'message',
                                    username: currentUsername,
                                    message: data.message,
                                    timestamp: new Date().toISOString(),
                                    isCurrentUser: false
                                };
                                
                                receiveMessage(responseData);
                                
                                // Simulate other users responding
                                if (Math.random() > 0.7) {
                                    setTimeout(() => {
                                        const botMessages = [
                                            "Got it!",
                                            "Let me check on that...",
                                            "We should discuss this in the next meeting",
                                            "That's a great point!",
                                            "I'll follow up with more details shortly",
                                            "Thanks for the update!"
                                        ];
                                        
                                        const botMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
                                        const botResponse = {
                                            type: 'message',
                                            username: 'Bot',
                                            message: botMessage,
                                            timestamp: new Date().toISOString(),
                                            isCurrentUser: false
                                        };
                                        
                                        receiveMessage(botResponse);
                                    }, 1000 + Math.random() * 3000);
                                }
                            } else if (data.type === 'typing') {
                                // Simulate typing indicator
                                if (!data.isTyping) {
                                    hideTypingIndicator();
                                } else {
                                    showTypingIndicator(data.username !== currentUsername ? data.username : 'Someone');
                                }
                            }
                        }, 200);
                    },
                    close: function() {
                        console.log('WebSocket closed');
                        updateConnectionStatus('Disconnected', 'bg-red-500');
                        handleDisconnection();
                    }
                };
                
                // Simulate initial past messages
                setTimeout(() => {
                    const pastMessages = [
                        { username: 'WelcomeBot', message: `👋 ${currentUsername} joined the room`, timestamp: new Date(Date.now() - 10000).toISOString(), isCurrentUser: false },
                        { username: 'Alex', message: 'Is anyone working on the new project?', timestamp: new Date(Date.now() - 9000).toISOString(), isCurrentUser: false },
                        { username: 'Sam', message: 'Yeah, I just pushed some initial UI components', timestamp: new Date(Date.now() - 8000).toISOString(), isCurrentUser: false },
                        { username: 'Taylor', message: 'The API endpoints should be ready by EOD', timestamp: new Date(Date.now() - 7000).toISOString(), isCurrentUser: false }
                    ];
                    
                    pastMessages.forEach(msg => receiveMessage(msg));
                }, 500);
            }
            
            // Handle disconnection
            function handleDisconnection() {
                sendButton.disabled = true;
                messageInput.disabled = true;
                
                if (reconnectAttempts < maxReconnectAttempts) {
                    console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
                    reconnectAttempts++;
                    
                    setTimeout(() => {
                        connect();
                    }, reconnectDelay);
                } else {
                    console.log('Max reconnection attempts reached');
                }
            }
            
            // Update connection status UI
            function updateConnectionStatus(status, colorClass) {
                const statusDot = connectionStatus.querySelector('span');
                const statusText = connectionStatus.querySelector('span:last-child');
                
                // Remove all color classes
                statusDot.classList.remove('bg-red-500', 'bg-green-500', 'bg-yellow-500');
                
                // Add new color class
                if (colorClass) statusDot.classList.add(colorClass);
                
                // Update text
                statusText.textContent = status;
                
                if (status === 'Connected') {
                    reconnectAttempts = 0;
                }
            }
            
            // Update user count UI
            function updateUserCount(count) {
                userCountElement.textContent = `${count}`;
            }
            
            // Show typing indicator
            function showTypingIndicator(username) {
                typingIndicator.querySelector('span').textContent = `${username} is typing`;
                typingIndicator.classList.remove('hidden');
                
                // Scroll to bottom to see typing indicator
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
            // Hide typing indicator
            function hideTypingIndicator() {
                typingIndicator.classList.add('hidden');
            }
            
            // Handle receiving a message
            function receiveMessage(data) {
                const messageElement = document.createElement('div');
                const isCurrentUser = data.username === currentUsername;
                
                const time = new Date(data.timestamp);
                const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                messageElement.className = `flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`;
                messageElement.innerHTML = `
                    <div class="message-transition max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${isCurrentUser ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}">
                        <div class="text-xs font-semibold ${isCurrentUser ? 'text-indigo-100' : 'text-gray-500'}">
                            ${data.username} ${isCurrentUser ? '(You)' : ''}
                        </div>
                        <div class="mt-1">${data.message}</div>
                        <div class="text-xs mt-1 ${isCurrentUser ? 'text-indigo-100' : 'text-gray-500'} text-right">
                            ${timeString}
                        </div>
                    </div>
                `;
                
                messages.insertBefore(messageElement, typingIndicator.parentNode);
                
                // Scroll to bottom to see new message
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Hide typing indicator if it's visible
                hideTypingIndicator();
            }
            
            // Send typing status
            function sendTypingStatus(typing) {
                if (!socket) return;
                
                const data = {
                    type: 'typing',
                    username: currentUsername,
                    isTyping: typing
                };
                
                socket.send(JSON.stringify(data));
                isTyping = typing;
            }
            
            // Check typing timeout
            function checkTypingTimeout() {
                const now = Date.now();
                const timeDiff = now - lastTypingTime;
                
                if (isTyping && timeDiff >= typingTimeout) {
                    sendTypingStatus(false);
                }
            }
            
            // Event Listeners
            messageInput.addEventListener('input', () => {
                lastTypingTime = Date.now();
                
                if (!isTyping) {
                    sendTypingStatus(true);
                }
            });
            
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && messageInput.value.trim()) {
                    sendMessage();
                }
            });
            
            sendButton.addEventListener('click', sendMessage);
            
            // Send message function
            function sendMessage() {
                const message = messageInput.value.trim();
                if (!message || !socket) return;
                
                const data = {
                    type: 'message',
                    username: currentUsername,
                    message: message,
                    timestamp: new Date().toISOString()
                };
                
                socket.send(JSON.stringify(data));
                messageInput.value = '';
                
                // Add sent message to UI immediately
                receiveMessage({ ...data, isCurrentUser: true });
                
                // Send typing stopped
                sendTypingStatus(false);
            }
            
            // Start checking typing timeout
            setInterval(checkTypingTimeout, 500);
            
            // Initialize connection
            connect();
        });
