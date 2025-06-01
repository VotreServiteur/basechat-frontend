import React from 'react';
import './MessagesStyles/ContextMenu.css'; 

function ContextMenu({
    contextMenuPositionY,
    contextMenuPositionX,
    selectedMessageIdForMenu,
    onDeleteMessage,
    onEditMessage
}) {
    return (
        <div
            className="context-menu"
            style={{ top: contextMenuPositionY, left: contextMenuPositionX }}
        >
            <div
                className="context-menu-item delete-item"
                onClick={() => onDeleteMessage(selectedMessageIdForMenu)}
            >
                Delete
            </div>
            <div
                className="context-menu-item edit-item"
                onClick={() => onEditMessage(selectedMessageIdForMenu)}
            >
                Edit
            </div>
        </div>
    )
}

export default ContextMenu;