import React from 'react';
import MessagesDisplay from './MessagesDisplay';
import MessageInputForm from './MessageInputForm';
import ContextMenu from './ContextMenu';
import './MessagesStyles/MessageArea.css';

function MessageArea({
    currentChat,
    currentChatName,
    wsStatus,
    messages,
    currentUser,
    isLoading,
    isLoadingMore,
    messagesEndRef,
    messagesRef,
    onContextMenu,

    isSameDay,
    formatDateSeparator,
    formatMessageTime,

    newMessage,
    onNewMessageChange,
    onSendMessage,
    editingMessageId,
    originalText,
    onCancelEdit,
    isLoadingChats,
    userChatsLength,
    bottomInputAreaRef,

    contextMenuVisible,
    contextMenuPositionY,
    contextMenuPositionX,
    selectedMessageIdForMenu,
    onDeleteMessage,
    onEditMessage
}) {
    const showPlaceholder = !isLoadingChats && !currentChat;

    return (
        <div className="message-area">
            {showPlaceholder ? (
                <div className="no-chats-placeholder">
                    <p>Press on + to start messaging or select existing chat.</p>
                </div>
            ) : (
                <>
                    <div className="chat-name">{currentChatName}</div>

                    <MessagesDisplay
                        messages={messages}
                        currentUser={currentUser}
                        isLoadingMore={isLoadingMore}
                        messagesEndRef={messagesEndRef}
                        messagesRef={messagesRef}
                        onContextMenu={onContextMenu}

                        isSameDay={isSameDay}
                        formatDateSeparator={formatDateSeparator}
                        formatMessageTime={formatMessageTime}
                    />

                    <MessageInputForm
                        newMessage={newMessage}
                        onNewMessageChange={onNewMessageChange}
                        onSendMessage={onSendMessage}
                        editingMessageId={editingMessageId}
                        originalText={originalText}
                        onCancelEdit={onCancelEdit}
                        isLoadingChats={isLoadingChats}
                        userChatsLength={userChatsLength}
                        isLoading={isLoading}
                        wsStatus={wsStatus}
                        bottomInputAreaRef={bottomInputAreaRef}
                    />
                </>
            )}
            {contextMenuVisible && (
                <ContextMenu
                    contextMenuPositionY = {contextMenuPositionY}
                    contextMenuPositionX = {contextMenuPositionX}
                    selectedMessageIdForMenu = {selectedMessageIdForMenu}
                    onDeleteMessage = {onDeleteMessage}
                    onEditMessage = {onEditMessage}
                />
            )}
        </div>
    );
}

export default MessageArea;