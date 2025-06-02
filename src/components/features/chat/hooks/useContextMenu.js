import { useEffect, useRef, useState } from "react";

function useContextMenu(currentUser) {
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedMessageIdForMenu, setSelectedMessageIdForMenu] = useState(null);

    const contextMenuVisibleRef = useRef(false);
    const contextMenuPositionRef = useRef({ x: 0, y: 0 });
    const selectedMessageIdForMenuRef = useRef(null);

    const handleContextMenu = (e, message) => {
        e.preventDefault();
        if (currentUser && String(message.sender_id) === String(currentUser.id)) {
            setContextMenuPosition({ x: e.clientX, y: e.clientY });
            setSelectedMessageIdForMenu(message.id);
            setContextMenuVisible(true);
        } else {
            setContextMenuVisible(false);
            setSelectedMessageIdForMenu(null);
        }
    };

    useEffect(() => {
        contextMenuVisibleRef.current = contextMenuVisible;
        contextMenuPositionRef.current = contextMenuPosition;
        selectedMessageIdForMenuRef.current = selectedMessageIdForMenu;
    }, [contextMenuVisible, contextMenuPosition, selectedMessageIdForMenu]);


    return {
        contextMenuVisible,
        contextMenuPosition,
        selectedMessageIdForMenu,
        contextMenuVisibleRef,
        contextMenuPositionRef,
        selectedMessageIdForMenuRef,
        setContextMenuVisible,
        handleContextMenu,
        setSelectedMessageIdForMenu
    }
}

export default useContextMenu;