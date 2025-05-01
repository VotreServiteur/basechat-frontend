import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForm.css';

function RegisterForm() {

    const [login, setLogin] = useState('');
    const [loginError, setLoginError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [repeatPassword, setRepeatPassword] = useState('');
    const [repeatPasswordError, setRepeatPasswordError] = useState('');

    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLoginChange = e => {
        setLogin(e.target.value);
        if (e.target.value.trim().length < 3) {
            setLoginError("Should be at least 3 symbols");
        } else if (e.target.value.startsWith(" ")) {
            setLoginError("Should not start with a space");
        } else {
            setLoginError("");
        }

        setGeneralError('');
    };

    const handlePasswordChange = e => {
        setPassword(e.target.value);
        if (e.target.value.length < 6) {
            setPasswordError("Password must be at least 6 characters");
        } else {
            setPasswordError("");
        }

        if (repeatPassword && e.target.value !== repeatPassword) {
            setRepeatPasswordError("Passwords do not match");
        } else {
            setRepeatPasswordError("");
        }

        setGeneralError('');

    };

    const handleRepeatPasswordChange = e => {
        setRepeatPassword(e.target.value);
        if (password !== e.target.value) {
            setRepeatPasswordError("Passwords do not match");
        } else {
            setRepeatPasswordError("");
        }

        setGeneralError('');

    };

    const handleSubmit = async e => {
        e.preventDefault();

        setGeneralError('');
        setIsLoading(true);

        let isValid = true;
        if (loginError || passwordError || repeatPasswordError) {
            isValid = false;
            if (login.trim().length < 3) setLoginError("Should be at least 3 symbols");
            if (login.startsWith(" ")) setLoginError("Should not start with a space");
            if (password.length < 6) setPasswordError("Password must be at least 6 characters");
            if (password !== repeatPassword) setRepeatPasswordError("Passwords do not match");
        }

        if (!isValid) {
            isLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login, password }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Registration successful:', data);
                navigate('/login');
            } else {
                setGeneralError(data.message || 'Registration failed');
                console.error('Registration failed:', data);

            }
        } catch (err) {
            setGeneralError('Network error. Retry.');
            console.error('Error during fetch:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <div id="register-form">
            <header>
                <a href="/" title="Main Page">
                    <span id="base-part">Base</span><span id="chat-part">Chat</span>
                </a>
            </header>
            <form method="post" className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Login:</label>
                <input
                    id="username"
                    type="text"
                    value={login}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                    required />
                {loginError && <p className="non-valid" id="user-error">{loginError}</p>}

                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    required />
                {passwordError && <p className="non-valid" id="password-error">{passwordError}</p>}

                <label htmlFor="repeat-pass">Repeat password:</label>
                <input
                    id="repeat-pass"
                    type="password"
                    value={repeatPassword}
                    onChange={handleRepeatPasswordChange}
                    disabled={isLoading}
                    required />
                {repeatPasswordError && <p className="non-valid" id="repeat-error">{repeatPasswordError}</p>}
                {generalError && <p className="non-valid">{generalError}</p>}

                <button type="submit">Sign Up</button>

                <p>
                    Already have an account? <Link to="/login" id="toggle-login">Log in</Link>
                </p>
            </form>
        </div>
    );
}

export default RegisterForm;