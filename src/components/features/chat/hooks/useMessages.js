import { useCallback, useState } from "react";

import { getTokenOrRedirect, handleAuthFailure } from "../utils/useAuthUtils";
import { useNavigate } from "react-router-dom";


function useMessages(setMessagesRef,setError, scrollToBottomCb) {

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    const navigate = useNavigate();

    const fetchMessages = useCallback(async (chatId, limit, beforeId = null) => {
        setIsLoading(true);
        setError(null);
        const token = getTokenOrRedirect(navigate, () => setIsLoading(false));


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
                    if (scrollToBottomCb) scrollToBottomCb('instant');
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
                handleAuthFailure(navigate);
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
    }, [navigate, scrollToBottomCb, setError, setMessagesRef]);
    
    return {
        isLoading,
        isLoadingMore,
        hasMoreMessages,        
        setIsLoading,
        setIsLoadingMore,
        setHasMoreMessages,
        fetchMessages
    };
}

export default useMessages;