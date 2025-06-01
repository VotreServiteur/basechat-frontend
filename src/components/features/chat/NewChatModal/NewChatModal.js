import React, { useState, useEffect } from 'react';
import './NewChatModal.css';  

function NewChatModal({ isOpen, onClose, onCreateChat, isLoading, error }) {
    const [partnerLogin, setPartnerLogin] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPartnerLogin('');
            setFormError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (error) {
            setFormError(error);
        } else {
            setFormError('');
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!partnerLogin.trim()) {
            setFormError('Login cannot be empty.');
            return;
        }

        onCreateChat(partnerLogin);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Create New Personal Chat</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter user login"
                        value={partnerLogin}
                        onChange={e => setPartnerLogin(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                    {formError && <p className="error-message">{formError}</p>}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create chat'}
                    </button>
                    <button type="button" onClick={onClose} disabled={isLoading}>Cancel</button>
                </form>
            </div>
        </div>
    );
}

export default NewChatModal;