import React, { useCallback, useEffect, useRef, useState } from "react";
import './Chat.css';

import NewChatModal from './NewChatModal/NewChatModal';
import ChatList from './ChatList/ChatList';
import MessageArea from './MessageArea/MessageArea';

import { useNavigate } from "react-router-dom";
import useChats from "./hooks/useChats";
import useMessages from "./hooks/useMessages";
import useMessageEditor from "./hooks/useMessageEditor";
import useMessageSend from "./hooks/useMessageSend";
import { isSameDay, formatDateSeparator, formatMessageTime, formatChatListTime } from './utils/dateFormatter';
import { getTokenOrRedirect } from "./utils/useAuthCheck";


function Chat() {

    const [newMessage, setNewMessage] = useState('');

    const [currentUser, setCurrentUser] = useState(null);


    const [wsStatus, setWsStatus] = useState('Connecting...');

    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedMessageIdForMenu, setSelectedMessageIdForMenu] = useState(null);

    const [isChatListVisible, setIsChatListVisible] = useState(true);

    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [newChatPartnerLogin, setNewChatPartnerLogin] = useState('');
    const [createChatError, setCreateChatError] = useState(null);

    const contextMenuVisibleRef = useRef(false);
    const contextMenuPositionRef = useRef({ x: 0, y: 0 });
    const selectedMessageIdForMenuRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesRef = useRef(null);

    const bottomInputAreaRef = useRef(null);
    const wsRef = useRef(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const setNewMessageRef = useRef(setMessages);
    const setMessagesRef = useRef(setMessages);

    const scrollToBottom = useCallback((behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    }, [messagesEndRef])

    const messagesHook = useMessages(setMessagesRef, setError, scrollToBottom);



    const editorHook = useMessageEditor(messages, setNewMessage, setError);

    const onChatSelectCallback = useCallback(async (chatId) => {
        editorHook.setEditingMessageId(null);
        editorHook.setOriginalText('');
        setNewMessage('');
        setError(null);
        messagesHook.fetchMessages(chatId, 50);
    }, [editorHook, messagesHook]);

    const chatHook = useChats(onChatSelectCallback);


    const sendHook = useMessageSend(chatHook, editorHook, newMessage, setNewMessage, scrollToBottom, setError, currentUser);;


    //
    //  HANDLERS
    //

    const handleToggleChatList = useCallback(() => {
        setIsChatListVisible(prev => !prev);
    }, []);


    const handleCreateChat = useCallback(async e => {
        e.preventDefault();

        const token = getTokenOrRedirect(navigate, () => setIsCreatingChat(false));

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

                    chatHook.currentChatId(createdOrFoundChat.id);
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

    }, [error, navigate, newChatPartnerLogin, chatHook]);




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
        const messagesElement = messagesRef.current;
        if (!messagesElement) return;
        const handleScroll = () => {
            const isNearTop = messagesElement.scrollTop < 20;
            console.log(`Scroll event: scrollTop = ${messagesElement.scrollTop}, isNearTop = ${isNearTop}`);
            if (isNearTop && messagesHook.hasMoreMessages && !messagesHook.isLoadingMore && messagesHook.messagesLength > 0) {
                console.log('Scrolled to top, attempting to load more messages.');
                const oldestMessage = messagesHook.messages[0];
                if (oldestMessage) {
                    console.log('Fetching messages before ID:', oldestMessage.id);
                    messagesHook.setIsLoadingMore(true);
                    messagesHook.fetchMessages(chatHook.currentChatId, 50, oldestMessage.id);
                } else {
                    console.log('No oldest message found in list.');
                    messagesHook.setHasMoreMessages(false);
                }
            }
        };
        messagesElement.addEventListener('scroll', handleScroll);
        return () => {
            console.log('Scroll effect cleanup: Removing scroll listener.');
            messagesElement.removeEventListener('scroll', handleScroll);
        }
    }, [messagesHook, chatHook]);
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
        console.log("Main effect running...");
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!storedUser || !token) {
            navigate('/login');
            return;
        }

        setCurrentUser(JSON.parse(storedUser));

        chatHook.fetchChats().then(fetchedChats => {
            if (fetchedChats && fetchedChats.length > 0) {
                console.log('Chats fetched');
            } else {
                console.log('No chats fetched for the user.');

                setMessages([]);
                messagesHook.setIsLoading(false);
            }
        }).catch(err => {

            console.error("Error during initial chat fetch:", err);
            messagesHook.setIsLoading(false);
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
                const activeChatId = chatHook.currentChatIdRef.current;
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

                                chatHook.setUserChats(prevUserChats => {
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
    }, [navigate, setCurrentUser, setWsStatus, scrollToBottom, setMessagesRef, setNewMessageRef, wsRef]);
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
                userChats={chatHook.userChats}
                currentChatId={chatHook.currentChatId}
                onSelectChat={chatHook.handleChatSelect}
                onNewChatClick={() => setIsCreatingChat(true)}
                isChatListVisible={isChatListVisible}
                isLoadingChats={chatHook.isLoadingChats}
                errorChats={chatHook.errorChats}
                onLogout={handleLogout}
                formatChatListTime={formatChatListTime}
            />
            <button onClick={handleToggleChatList} className="toggle-chat-list-button">
                {isChatListVisible ? '◀' : '▶'}
            </button>
            <MessageArea
                currentChat={chatHook.currentChat}
                currentChatName={chatHook.currentChatName}
                wsStatus={wsStatus}
                messages={messages}
                currentUser={currentUser}
                isLoading={messagesHook.isLoading}
                isLoadingMore={messagesHook.isLoadingMore}
                messagesEndRef={messagesEndRef}
                messagesRef={messagesRef}
                onContextMenu={handleContextMenu}

                isSameDay={isSameDay}
                formatDateSeparator={formatDateSeparator}
                formatMessageTime={formatMessageTime}

                newMessage={newMessage}
                onNewMessageChange={setNewMessage}
                onSendMessage={sendHook.handleSendMessage}
                editingMessageId={editorHook.editingMessageId}
                originalText={editorHook.originalText}
                onCancelEdit={editorHook.handleCancelEdit}
                isLoadingChats={chatHook.isLoadingChats}
                userChatsLength={chatHook.userChatsLength}
                bottomInputAreaRef={bottomInputAreaRef}

                contextMenuVisible={contextMenuVisible}
                contextMenuPositionY={contextMenuPosition.y}
                contextMenuPositionX={contextMenuPosition.x}
                selectedMessageIdForMenu={selectedMessageIdForMenu}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={editorHook.handleEditMessage}
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
                        isLoading={messagesHook.isLoading}
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