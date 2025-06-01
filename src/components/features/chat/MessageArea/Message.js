import React from 'react';
import './MessagesStyles/Message.css';

function Message({
    message,
    currentUser,
    onContextMenu,
    formatMessageTime
}) {
    const isSender = currentUser && String(message.sender_id) === String(currentUser.id);

    return (
        <div
            className={`message ${ isSender? 'sent' : 'received'}`}
            onContextMenu={e => onContextMenu(e, message)}
        >
            <div className="message-sender">{isSender ? 'You' : message.sender_login}</div>
            <div className="message-text">{message.text}</div>
            <div className="message-date">{formatMessageTime(message.created_at)}</div>
        </div>
    );
}

export default Message;