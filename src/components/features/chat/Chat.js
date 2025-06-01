import React, { useCallback, useEffect, useRef, useState } from "react";
import './Chat.css';

import NewChatModal from './NewChatModal/NewChatModal';
import ChatList from './ChatList/ChatList';
import MessageArea from './MessageArea/MessageArea';

import { useNavigate } from "react-router-dom";

function Chat() {

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingMessageId, setEditingMessageId] = useState(null);
    const [originalText, setOriginalText] = useState('');

    const [wsStatus, setWsStatus] = useState('Connecting...');

    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedMessageIdForMenu, setSelectedMessageIdForMenu] = useState(null);

    const [userChats, setUserChats] = useState([]);
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [errorChats, setErrorChats] = useState(null);
    const [currentChatId, setCurrentChatId] = useState(1);
    const [isChatListVisible, setIsChatListVisible] = useState(true);

    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [newChatPartnerLogin, setNewChatPartnerLogin] = useState('');
    const [createChatError, setCreateChatError] = useState(null);


    const contextMenuVisibleRef = useRef(false);
    const contextMenuPositionRef = useRef({ x: 0, y: 0 });
    const selectedMessageIdForMenuRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesRef = useRef(null);
    const setMessagesRef = useRef(setMessages);
    const setNewMessageRef = useRef(setMessages);
    const bottomInputAreaRef = useRef(null);
    const wsRef = useRef(null);
    const setCurrentChatIdRef = useRef(setCurrentChatId);
    const currentChatIdRef = useRef(null);

    const currentChat = userChats.find(chat => String(chat.id) === String(currentChatId));
    const currentChatName = currentChat ? currentChat.name : 'Select a chat';


    const scrollToBottom = useCallback((behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    }, [messagesEndRef])

    const fetchChats = useCallback(async () => {
        setIsLoadingChats(true);
        setErrorChats(null);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            setIsLoadingChats(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/api/chats', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched user data:', data);
                if (data.success && Array.isArray(data.chats)) {
                    setUserChats(data.chats);
                } else {
                    console.error('Failed to fetch user chats: Unexpected data format', data);
                    setErrorChats('Failed to load chat list: Invalid data from server.')
                }
            } else if (response.status === 401 || response.status === 403) {
                console.error('Authentication error while fetching user chats.');
                localStorage.removeItem('token');
                localStorage.removeItem('userLogin');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch user chats (HTTP error):', response.status, errorData);
                setErrorChats(errorData.message || `Failed to fetch chat list (Status: ${response.status})`);
            }
        } catch (err) {
            console.error('Network error while fetching user chats:', err);
            setErrorChats('Network error while fetching chat list. Please try again.');
        } finally {
            setIsLoadingChats(false);
        }
    }, [navigate, setUserChats, setErrorChats]);

    const fetchMessages = useCallback(async (chatId, limit, beforeId = null) => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            setIsLoading(false);
            return;
        }
        if (chatId === undefined || chatId === null) {
            console.error('chatId is required for fetchMessages');
            setError('Internal error: Chat ID is missing.');
            setIsLoading(false);
            if (beforeId !== null) setIsLoadingMore(false);
            return;
        }
        let url = `http://localhost:3001/api/messages?chat_id=${chatId}&limit=${limit}`;
        if (beforeId !== null) {
            url += `&before_id=${beforeId}`;
        }
        console.log('Fetching messages from URL:', url);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched message data:', data);
                if (beforeId === null) {
                    setMessagesRef.current(data.messages.reverse());
                    scrollToBottom('instant');
                } else {
                    setMessagesRef.current(prevMessages => {
                        const newMessagesToPrepend = data.messages.filter(
                            newMessage => !prevMessages.some(existingMessage => String(existingMessage.id) === String(newMessage.id))
                        ).reverse();
                        if (newMessagesToPrepend.length > 0) {
                            console.log(`Prepending ${newMessagesToPrepend.length} messages.`)
                            return [...newMessagesToPrepend, ...prevMessages];
                        } else {
                            console.log('No new messages to prepend.');
                            return prevMessages;
                        }
                    })
                    setHasMoreMessages(data.hasMore);
                }
            } else if (response.status === 401 || response.status === 403) {
                console.error('Authentication error while fetching messages.');
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
            setError('Network error while fetching messages. Please try again.');
            console.error('Error fetching messages:', err);
        } finally {
            setIsLoading(false);
            if (beforeId !== null) {
                setIsLoadingMore(false);
            }
        }
    }, [navigate, scrollToBottom]);


    const isSameDay = (timestamp1, timestamp2) => {
        if (!timestamp1 || !timestamp2) return false;
        const date1 = new Date(timestamp1);
        const date2 = new Date(timestamp2);
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }
    const formatDateSeparator = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (isSameDay(timestamp, today.toISOString())) {
            return 'Today';
        } else if (isSameDay(timestamp, yesterday.toISOString())) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(undefined, options);
        }
    }
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const options = { hour: '2-digit', minute: '2-digit' };
        return date.toLocaleTimeString(undefined, options);
    }

    const formatChatListTime = (timestamp) => {
        if (!timestamp) return '';
        return formatMessageTime(timestamp);
    };

    //
    //  HANDLERS
    //



    const handleToggleChatList = useCallback(() => {
        setIsChatListVisible(prev => !prev);
    }, []);

    const handleCreateChat = useCallback(async e => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting to login.');
            navigate('/login');
            return;
        }

        if (!newChatPartnerLogin.trim()) {
            setCreateChatError('Please enter a user login.');
            return;
        }

        setCreateChatError(null);
        try {
            const response = await fetch('http://localhost:3001/api/chats', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    otherUserLogin: newChatPartnerLogin.trim()
                }),
            })

            const data = await response.json();
            if (data.success) {
                console.log('Chat creation/find successful:', data.chat);

                const createdOrFoundChat = data.chat;

                if (createdOrFoundChat && createdOrFoundChat.id) {
                    console.log('Selecting the created/found chat:', createdOrFoundChat.id);

                    setCurrentChatId(createdOrFoundChat.id);
                } else {
                    console.warn('Chat creation/find reported success, but chat data is missing in response.');
                }

            }

            setNewChatPartnerLogin('');
            setIsCreatingChat(false);
            setCreateChatError(null);
        } catch (err) {
            console.error('Error during chat creation fetch:', error);
            setCreateChatError('An unexpected error occurred while trying to create the chat.');
        }

    }, [error, navigate, newChatPartnerLogin]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting to login.');
            navigate('/login');
            return;
        }
        const chatIdToSend = currentChatId;

        if (editingMessageId) {
            console.log('Saving edited message with ID:', editingMessageId);
            if (!newMessage.trim()) {
                setError('Edited message text cannot be empty.');
            }
            try {
                const response = await fetch(`http://localhost:3001/api/messages/${editingMessageId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: newMessage.trim() })
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('Message updated', result);
                    handleCancelEdit();
                } else if (response.status === 401 || response.status === 403) {
                    console.error('Authentication error while updating message.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
                else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to update message');
                    console.error('Failed to update message:', response.status, errorData);
                }
            } catch (err) {
                console.error('Network error while updating message:', err);
                setError('Network error while updating message. Please try again.');
            }
        }
        else {
            console.log('Attempting to send message to chat:', chatIdToSend);
            if (newMessage.trim().length === 0 || !currentUser) {
                console.log('Message is empty or user not loaded.');
                return;
            }
            try {
                const response = await fetch('http://localhost:3001/api/messages', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: newMessage.trim(),
                        chatId: chatIdToSend
                    })
                });
                if (response.ok) {
                    const sentMessageData = await response.json();
                    console.log('Message sent:', sentMessageData);
                    if (sentMessageData.success && sentMessageData.messageData) {
                        setNewMessage('');
                        scrollToBottom();
                    } else {
                        console.error('Message sent, but unexpected response data:', sentMessageData);
                        setError('Message sent, but failed to update chat.');
                    }
                } else if (response.status === 401 || response.status === 403) {
                    console.error('Authentication error while sending message.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
                else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to send message');
                    console.error('Failed to send message:', response.status, errorData);
                }
            } catch (error) {
                setError('Network error while sending message. Please try again.');
                console.error('Error sending message:', error);
            }
        }
    }
    const handleDeleteMessage = async (messageId) => {
        console.log('Attempting to delete message with ID:', messageId);
        setContextMenuVisible(false);
        setSelectedMessageIdForMenu(null);
        if (!currentUser || !messageId) {
            console.log('Cannot delete: currentUser not loaded or no messageId.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found for deletion, redirecting to login.');
            navigate('/login');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this message?')) {
            console.log('Deletion cancelled by user.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to delete message');
                console.error('Failed to delete message:', response.status, errorData);
            } else {
                const result = await response.json();
                console.log('Message deleted (HTTP response):', result);
            }
        } catch (error) {
            setError('Network error while deleting message. Please try again.');
            console.error('Error deleting message:', error);
        }
    };

    const handleEditMessage = (messageId) => {
        console.log('Edit clicked for message ID:', messageId);
        const messageToEdit = messages.find(msg => String(msg.id) === String(messageId));

        if (messageToEdit) {
            setEditingMessageId(messageToEdit.id);
            setOriginalText(messageToEdit.text);
            setNewMessage(messageToEdit.text);
            console.log('Editing mode activated for message ID:', messageId);
        } else {
            console.error(`Message with ID ${messageId} not found.`);
            setError('Failed to find message to edit');
        }
        setContextMenuVisible(false);
        setSelectedMessageIdForMenu(null);
    };
    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setOriginalText('');
        setNewMessage('')
        setError(null);
    };
    const handleContextMenu = (e, message) => {
        e.preventDefault();
        if (currentUser && String(message.sender_id) === String(currentUser.id)) {
            setContextMenuPosition({ x: e.clientX, y: e.clientY });
            setSelectedMessageIdForMenu(message.id);
            setContextMenuVisible(true);
        } else {
            setContextMenuVisible(false);
            setSelectedMessageIdForMenu(null);
        }
    };

    const handleChatSelect = useCallback((chatId) => {
        console.log('Chat selected:', chatId);
        setCurrentChatId(chatId);
        setEditingMessageId(null);
        setOriginalText('');
        setNewMessage('');
        setError(null);
        fetchMessages(chatId, 50);
    }, [setCurrentChatId, setEditingMessageId, setOriginalText, setError, fetchMessages]);


    const handleLogout = (() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userLogin');
        localStorage.removeItem('user');
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }
        navigate('/login');
    });


    //
    // USE EFFECTS
    //






    useEffect(() => {
        setCurrentChatIdRef.current = setCurrentChatId;
    }, [])
    useEffect(() => {
        const messagesElement = messagesRef.current;
        if (!messagesElement) return;
        const handleScroll = () => {
            const isNearTop = messagesElement.scrollTop < 20;
            console.log(`Scroll event: scrollTop = ${messagesElement.scrollTop}, isNearTop = ${isNearTop}`);
            if (isNearTop && hasMoreMessages && !isLoadingMore && messages.length > 0) {
                console.log('Scrolled to top, attempting to load more messages.');
                const oldestMessage = messages[0];
                if (oldestMessage) {
                    console.log('Fetching messages before ID:', oldestMessage.id);
                    setIsLoadingMore(true);
                    fetchMessages(currentChatId, 50, oldestMessage.id);
                } else {
                    console.log('No oldest message found in list.');
                    setHasMoreMessages(false);
                }
            }
        };
        messagesElement.addEventListener('scroll', handleScroll);
        return () => {
            console.log('Scroll effect cleanup: Removing scroll listener.');
            messagesElement.removeEventListener('scroll', handleScroll);
        }
    }, [messages, hasMoreMessages, isLoadingMore, currentChatId, fetchMessages]);
    useEffect(() => {
        setMessagesRef.current = setMessages;
    }, []);
    useEffect(() => {
        setNewMessageRef.current = setNewMessage;
    }, []);
    useEffect(() => {
        contextMenuVisibleRef.current = contextMenuVisible;
        contextMenuPositionRef.current = contextMenuPosition;
        selectedMessageIdForMenuRef.current = selectedMessageIdForMenu;
    }, [contextMenuVisible, contextMenuPosition, selectedMessageIdForMenu]);
    useEffect(() => {
        currentChatIdRef.current = currentChatId;
    }, [currentChatId])

    useEffect(() => {
        console.log("Main effect running...");
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!storedUser || !token) {
            navigate('/login');
            return;
        }
        setCurrentUser(JSON.parse(storedUser));
        fetchChats().then(fetchedChats => {
            if (fetchedChats && fetchedChats.length > 0) {
                console.log('Chats fetched');
            } else {
                console.log('No chats fetched for the user.');

                setMessages([]);
                setIsLoading(false);
            }
        }).catch(err => {

            console.error("Error during initial chat fetch:", err);
            setIsLoading(false);
        });

        let ws = wsRef.current;
        const wsUrl = 'ws://localhost:3001';
        if (!ws) {
            console.log('Establishing new WebSocket connection...');
            ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            setWsStatus('Connecting...');
        } else {
            console.log('Using existing WebSocket connection.');
            if (ws.readyState === WebSocket.OPEN) {
                setWsStatus('Connected');
            } else if (ws.readyState === WebSocket.CONNECTING) {
                setWsStatus('Connecting...');
            } else {
                if (ws.readyState !== WebSocket.CLOSING && ws.readyState !== WebSocket.CLOSED) {
                    ws.close(1000, 'Reconnecting');
                }
                ws = new WebSocket(wsUrl);
                wsRef.current = ws;
                setWsStatus('Connecting...');
            }
        }
        ws.onopen = () => {
            console.log('WebSocket connection established');
            setWsStatus('Connected');
            console.log('Sending auth token...');
            ws.send(JSON.stringify({
                type: 'auth',
                token: token
            }));
        };

        ws.onmessage = event => {
            console.log('WebSocket message received:', event.data)
            try {
                const notification = JSON.parse(event.data);
                console.log('Received notification type:', notification.type);
                const activeChatId = currentChatIdRef.current;
                if (notification.type === 'new_message') {
                    const message = notification.messageData;
                    if (message && String(message.chat_id) === String(activeChatId)) {
                        setMessagesRef.current(prevMessages => {
                            if (!prevMessages.find(msg => String(msg.id) === String(message.id))) {
                                console.log('Adding new message:', message);
                                return [...prevMessages, message];
                            } else {
                                console.log('Skipping duplicate new message:', message);
                                return prevMessages;
                            }
                        });
                        scrollToBottom();
                    } else {
                        if (message) {
                            console.log(`Received new message for chat ID ${message.chat_id}, but current active chat is ${activeChatId}`);
                        } else {
                            console.warn('Received new_message notification without messageData.');
                        }
                    }
                } else if (notification.type === 'message_deleted') {
                    const deletedMessageId = notification.messageId;
                    const messageChatId = notification.chatId;
                    if (deletedMessageId && String(messageChatId) === String(activeChatId)) {
                        console.log('Deleting message with ID:', deletedMessageId, 'from active chat state.');
                        setMessagesRef.current(prevMessages => {
                            const updatedMessages = prevMessages.filter(msg => String(msg.id) !== String(deletedMessageId));
                            if (updatedMessages.length < prevMessages.length) {
                                console.log('Removed message with ID:', deletedMessageId);
                            } else {
                                console.log('Message with ID', deletedMessageId, 'not found in state.');
                            }
                            return updatedMessages;
                        })
                    };
                } else if (notification.type === 'message_updated') {
                    const updatedMessageData = notification.messageData;
                    if (updatedMessageData && String(updatedMessageData.chat_id) === String(activeChatId)) {
                        console.log('Received message_updated notification for ID:', updatedMessageData.id);
                        setMessagesRef.current(prevMessages => {
                            return prevMessages.map(msg =>
                                String(msg.id) === String(updatedMessageData.id) ? updatedMessageData : msg
                            );
                        });
                    }
                } else if (notification.type === 'new_chat') {
                    const newChatData = notification.chat;
                    if (newChatData && newChatData.id && newChatData.participants && Array.isArray(newChatData.participants)) {
                        const currentUser = JSON.parse(storedUser);

                        if (currentUser.login && currentUser.id) {
                            const otherParticipant = newChatData.participants.find(p => String(p.id) !== String(currentUser.id));
                            if (otherParticipant) {
                                const chatNameForCurUser = otherParticipant.login;
                                const chatToAdd = {
                                    id: newChatData.id,
                                    name: chatNameForCurUser,
                                    type: newChatData.type,
                                    created_at: newChatData.createdAt,
                                    participants: newChatData.participants
                                };

                                setUserChats(prevUserChats => {
                                    if (!prevUserChats.find(chat => String(chat.id) === String(chatToAdd.id))) {
                                        console.log('Adding new chat to userChats state:', chatToAdd);
                                        return [...prevUserChats, chatToAdd];
                                    } else {
                                        console.log('Skipping duplicate new chat notification for ID:', chatToAdd.id);
                                        return prevUserChats;
                                    }
                                })
                            } else {
                                console.warn('Received new_chat notif, but could not find other participants');
                            }
                        } else {
                            console.warn('Received new_chat notif, but current user data is not available');
                        }
                    } else {
                        console.warn('Received invalid new_chat notif payload', notification);
                    }
                }

            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setWsStatus('Error');
        };
        ws.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            setWsStatus('Disconnected');
        };
        wsRef.current = ws;

        const handleOutsideClick = () => {
            if (contextMenuVisibleRef.current) {
                setContextMenuVisible(false);
                setSelectedMessageIdForMenu(null);
            }
        };
        document.addEventListener('click', handleOutsideClick);

        return () => {
            console.log('Main effect cleanup: Closing WebSocket connection');
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
                wsRef.current = null;
            }
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [navigate, fetchMessages, setCurrentUser, setWsStatus, fetchChats, scrollToBottom, setMessagesRef, setNewMessageRef, wsRef]);

    if (error) {
        return <div className="error">Error: {error}</div>;
    }
    if (!Array.isArray(messages)) {
        console.error("Messages state is not an array:", messages);
        return <div className="error">Error: Invalid messages data</div>;
    }





    //
    //  JSX
    //

    return (
        <div className="chat-container">

            <ChatList
                userChats={userChats}
                currentChatId={currentChatId}
                onSelectChat={handleChatSelect}
                onNewChatClick={() => setIsCreatingChat(true)}
                isChatListVisible={isChatListVisible}
                isLoadingChats={isLoadingChats}
                errorChats={errorChats}
                onLogout={handleLogout}
                formatChatListTime={formatChatListTime}
            />
            <button onClick={handleToggleChatList} className="toggle-chat-list-button">
                {isChatListVisible ? '◀' : '▶'}
            </button>
            <MessageArea
                currentChat={currentChat}
                currentChatName={currentChatName}
                wsStatus={wsStatus}
                messages={messages}
                currentUser={currentUser}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                messagesEndRef={messagesEndRef}
                messagesRef={messagesRef}
                onContextMenu={handleContextMenu}

                isSameDay={isSameDay}
                formatDateSeparator={formatDateSeparator}
                formatMessageTime={formatMessageTime}
                
                newMessage={newMessage}
                onNewMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
                editingMessageId={editingMessageId}
                originalText={originalText}
                onCancelEdit={handleCancelEdit}
                isLoadingChats={isLoadingChats}
                userChatsLength={userChats.length}
                bottomInputAreaRef={bottomInputAreaRef}
                
                contextMenuVisible={contextMenuVisible}
                contextMenuPositionY={contextMenuPosition.y}
                contextMenuPositionX={contextMenuPosition.x}
                selectedMessageIdForMenu={selectedMessageIdForMenu}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
            />

            {
                isCreatingChat && (
                    <NewChatModal
                        isOpen={isCreatingChat}
                        onClose={() => {
                            setIsCreatingChat(false);
                            setCreateChatError('');
                            setNewChatPartnerLogin('');
                        }}
                        onCreateChat={handleCreateChat}
                        isLoading={isLoading}
                        error={createChatError}
                        newChatPartnerLogin={newChatPartnerLogin}
                        onNewChatPartnerLoginChange={setNewChatPartnerLogin}
                    />
                )
            }
        </div >
    );
}
export default Chat;