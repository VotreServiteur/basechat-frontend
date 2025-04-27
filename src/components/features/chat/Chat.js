import React, { useEffect, useRef, useState } from "react";
import './Chat.css';
import { useNavigate } from "react-router-dom";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }

            if (!token) {
                navigate('/login');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('http://localhost:3001/api/messages', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                } else if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to fetch messages');
                    console.error('Failed to fetch messages:', response.status, errorData);
                }
            } catch (err) {
                setError('Network error. Retry.');
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [navigate, error]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async e => {
        e.preventDefault();
        console.log('handleSendMessage triggered');
        if (newMessage.trim() && currentUser) {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:3001/api/messages', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: newMessage }),
                });

                if (response.ok) {
                    const sentMessageData = await response.json();
                    console.log('Message sent:', sentMessageData);
                    if (sentMessageData.success && sentMessageData.messageData) {
                        setMessages(prevMessages => [...prevMessages, sentMessageData.messageData]);
                        setNewMessage('');
                    } else {
                        console.error('Message sent, but unexpected response data:', sentMessageData);
                        setError('Message sent, but failed to update chat.');
                    }
                    
                } else if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to send message');
                    console.error('Failed to send message:', response.status, errorData);
                }

            } catch (err) {
                setError('Network error. Retry.');
                console.error('Error sending message:', err);
            }
        }
    }

    const formatMessageData = timestamp => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        return date.toLocaleDateString(undefined, options);
    };

    if (isLoading) {
        return <div>Loading messages...</div>
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!Array.isArray(messages)) {
        console.error("Messages state is not an array:", messages);
        return <div className="error">Error: Invalid messages data</div>;
    }

    return (
        <div className="chat-column">
            <div className="messages" id="message">
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`message ${currentUser && message.sender_id === currentUser.id ? 'right' : 'left'} ${message.sender_id} ${currentUser}`}
                    >
                        {message.sender_login && <div className="sender-login">{message.sender_login}</div>}
                        <div className="message-text">{message.text}</div>
                        <div className="message-date">{formatMessageData(message.created_at)}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="message-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    disabled={isLoading}
                    required
                />
                <button type="submit" >&#11189;</button>
            </form>
        </div>
    );
}

export default Chat;