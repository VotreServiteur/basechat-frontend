import React from 'react';
import './MessagesStyles/MessageInputForm.css'; 

function MessageInputForm({
    newMessage,             
    onNewMessageChange,     
    onSendMessage,          
    editingMessageId,       
    originalText,           
    onCancelEdit,           
    isLoadingChats,         
    userChatsLength,        
    isLoading,              
    wsStatus,               
    bottomInputAreaRef      
}) {
    return (
        < div className="bottom-input-area" ref={bottomInputAreaRef}>
                    {editingMessageId && (
                        <div className="editing-indicator">
                            <div className="original-text-preview">
                                <span className="editing-message">Editing message:</span>
                                <span className="original-text">{originalText}</span>
                            </div>
                            <button
                                className="cancel-edit-button"
                                onClick={onCancelEdit}
                                disabled={isLoading}
                            >&#x2716;</button>
                        </div>
                    )}
                    <form className="message-form" onSubmit={onSendMessage}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={e => onNewMessageChange(e.target.value)}
                            disabled={isLoadingChats || userChatsLength === 0 || isLoading}
                            required
                        />
                        <button type="submit" disabled={isLoadingChats || userChatsLength === 0 || isLoading || !newMessage.trim() || wsStatus !== 'Connected'}>
                            {editingMessageId ? '\u2713' : '\u27A4'}
                        </button>
                    </form>
                </div>

                
    );
}

export default MessageInputForm;