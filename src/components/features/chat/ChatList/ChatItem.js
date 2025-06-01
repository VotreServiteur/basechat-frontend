import React from 'react';

function ChatItem({ chat, isActive, onClick, formatChatListTime }) {
    return (
        <div
            key={chat.id}
            className={`chat-list-item ${isActive ? 'active' : ''}`}
            onClick={() => onClick(chat.id)}
        >
            <div className="chat-info">
                <div className="chat-info-top">
                    <div className="side-chat-name">{chat.name}</div>
                    <div className="chat-last-message-time">
                        {chat.lastMessageCreatedAt ? formatChatListTime(chat.lastMessageCreatedAt) : '--:--'}
                    </div>
                </div>
                <div className="chat-info-bottom">
                    <div className="chat-last-message-snippet">
                        {chat.lastMessageText ? chat.lastMessageText : 'No messages yet.'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatItem;