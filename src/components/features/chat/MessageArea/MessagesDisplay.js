import React from 'react';
import Message from './Message'; 
import './MessagesStyles/MessagesDisplay.css'; 

function MessagesDisplay({
    messages,
    currentUser,
    isLoadingMore,
    messagesEndRef,     
    messagesRef,        
    onContextMenu,      

    isSameDay,          
    formatDateSeparator,
    formatMessageTime   
}) {
    

    return (
        <div className="messages" ref={messagesRef}>
        
            {isLoadingMore && <div className="pagination-loader">Loading more messages...</div>}

            {messages.map((message, index) => {
                const previousMessage = messages[index - 1];
                const showDateSeparator = index === 0 || !isSameDay(message.created_at, previousMessage.created_at);
                
                return (
                    <React.Fragment key={message.id}>
                        {showDateSeparator && (
                            <div className="date-separator">
                                <span>{formatDateSeparator(message.created_at)}</span>
                            </div>
                        )}
                        <Message
                            message={message}
                            currentUser={currentUser}
                            onContextMenu={onContextMenu}
                            formatMessageTime={formatMessageTime}
                        />
                    </React.Fragment>
                );
            })}
            <div ref={messagesEndRef} /> 
        </div>
    );
}

export default MessagesDisplay;