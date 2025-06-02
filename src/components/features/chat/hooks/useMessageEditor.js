import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

function useMessageEditor(messages, setNewMessage, setError, currentUser, contextMenuHook) {
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [originalText, setOriginalText] = useState('');

    const navigate = useNavigate();

    const handleEditMessage = useCallback((messageId) => {
        const messageToEdit = messages.find(msg => String(msg.id) === String(messageId));
        if (messageToEdit) {
            setEditingMessageId(messageToEdit.id);
            setOriginalText(messageToEdit.text);
            setNewMessage(messageToEdit.text);
        } else {
            setError('Failed to find message to edit');
        }
    }, [messages, setError, setNewMessage]);

    const handleCancelEdit = useCallback(() => {
        setEditingMessageId(null);
        setOriginalText('');
        setNewMessage('');
        setError(null);
    }, [setError, setNewMessage]);


    const handleDeleteMessage = async (messageId) => {
        console.log('Attempting to delete message with ID:', messageId);
        contextMenuHook.setContextMenuVisible(false);
        contextMenuHook.setSelectedMessageIdForMenu(null);
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

    return {
        editingMessageId,
        originalText,
        handleDeleteMessage,
        setOriginalText,
        setEditingMessageId,
        handleEditMessage,
        handleCancelEdit
    };
}

export default useMessageEditor;