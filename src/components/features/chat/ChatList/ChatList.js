import React from 'react';
import ChatItem from './ChatItem';
import './ChatList.css'; 

function ChatList({
    userChats,
    currentChatId,
    onSelectChat,
    onNewChatClick,
    isChatListVisible,
    isLoadingChats,
    errorChats,
    onLogout, 
    formatChatListTime 
}) {
    return (
        <div className={`chat-list ${isChatListVisible ? '' : 'hidden'}`}>
            <button onClick={onNewChatClick} className="new-chat-button">
                +
            </button>
            <div className="chat-list-header">Your Chats</div>
            {isLoadingChats}
            {errorChats && <div className='chat-list-status error'> Error loading chats. {errorChats}</div>}

            <div className="chat-items-container">
                {userChats.map(chat => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={String(chat.id) === String(currentChatId)}
                        onClick={onSelectChat}
                        formatChatListTime={formatChatListTime}
                    />
                ))}
            </div>
            <div className="logout-button" onClick={onLogout}>LogOut</div>
        </div>
    );
}

export default ChatList;