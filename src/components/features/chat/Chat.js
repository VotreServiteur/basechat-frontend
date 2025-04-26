import React, { useEffect, useRef, useState } from "react";
import './Chat.css';

function Chat() {
    const [messages, setMessages] = useState([
        { text: 'Hello!', sender: 'other' },
        { text: 'How is goinon', sender: 'me' },

    ]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = e => {
        e.preventDefault();
        if (newMessage.trim()) {
            setMessages([...messages, { text: newMessage, sender: "me" }]);
            setNewMessage("");
            scrollToBottom();
        }
    }

    return (
        <div className="chat-column">
            <div className="messages" id="message">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.sender === "me" ? "right" : "left"}`}
                    >
                        {message.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="message-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    required
                />
                <button type="submit">&#11189;</button>
            </form>
        </div>
    );
}

export default Chat;