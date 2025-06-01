import { useCallback, useState } from "react";

function useMessageEditor(messages, setNewMessage, setError) {
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [originalText, setOriginalText] = useState('');



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

    return {
        editingMessageId,
        originalText,
        setOriginalText,
        setEditingMessageId,
        handleEditMessage,
        handleCancelEdit
    };
}

export default useMessageEditor;