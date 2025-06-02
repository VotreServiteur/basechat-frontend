import { useNavigate } from "react-router-dom";
import { getTokenOrRedirect, handleAuthFailure } from "../utils/useAuthUtils";


function useMessagesSend(chatHook, editorHook, newMessage, setNewMessage, scrollToBottomCb, setError, currentUser) {


    const navigate = useNavigate();



    const handleSendMessage = async (e) => {
        e.preventDefault();

        const token = getTokenOrRedirect(navigate, () => chatHook.setIsLoadingChats(false));
        const chatIdToSend = chatHook.currentChatId;



        if (editorHook.editingMessageId) {
            console.log('Saving edited message with ID:', editorHook.editingMessageId);
            if (!newMessage.trim()) {
                setError('Edited message text cannot be empty.');
            }
            try {
                const response = await fetch(`http://localhost:3001/api/messages/${ editorHook.editingMessageId}`, {
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
                    editorHook.handleCancelEdit();
                } else if (response.status === 401 || response.status === 403) {
                    console.error('Authentication error while updating message.');
                    handleAuthFailure(navigate);
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
                console.log('Message is empty or user not loaded.', currentUser);
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
                        scrollToBottomCb();
                    } else {
                        console.error('Message sent, but unexpected response data:', sentMessageData);
                        setError('Message sent, but failed to update chat.');
                    }
                } else if (response.status === 401 || response.status === 403) {
                    console.error('Authentication error while sending message.');
                    handleAuthFailure(navigate);
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
    return {
        handleSendMessage
    }
}

export default useMessagesSend;