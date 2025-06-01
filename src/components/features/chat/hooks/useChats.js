import { useCallback, useEffect, useRef, useState } from "react";
import { getTokenOrRedirect, handleAuthFailure } from "../utils/useAuthCheck";
import { useNavigate } from "react-router-dom";

function useChats(onChatSelectCallback) {

    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [errorChats, setErrorChats] = useState(null);
    const [userChats, setUserChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(1);

    const navigate = useNavigate();

    const currentChat = userChats.find(chat => String(chat.id) === String(currentChatId));
    const currentChatName = currentChat ? currentChat.name : 'Select a chat';

    const currentChatIdRef = useRef(setCurrentChatId);
    const setCurrentChatIdRef = useRef(setCurrentChatId);

    const userChatsLength = userChats.length;

    const fetchChats = useCallback(async () => {
        setIsLoadingChats(true);
        setErrorChats(null);

        const token = getTokenOrRedirect(navigate, () => setIsLoadingChats(false));

        if (!token) return;
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
                handleAuthFailure(navigate);
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
    }, [navigate]);

    const handleChatSelect = useCallback((chatId) => {
        console.log('Chat selected:', chatId);
        setCurrentChatId(chatId);
        if (onChatSelectCallback) {
            onChatSelectCallback(chatId);
        }
    }, [onChatSelectCallback]);

    useEffect(() => {
        currentChatIdRef.current = currentChatId;
    }, [currentChatId])

    useEffect(() => {
        setCurrentChatIdRef.current = setCurrentChatId;
    }, [])
    return {
        isLoadingChats,
        errorChats,
        userChats,
        currentChat,
        currentChatName,
        currentChatId,
        currentChatIdRef,
        userChatsLength,
        handleChatSelect,
        fetchChats
    }
}

export default useChats;