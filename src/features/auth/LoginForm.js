import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthForm.css';

function LoginForm() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleSubmit = e => {
        e.preventDefault();
    };

    return (
        <div id="login-form">
            <form method="post" className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Login:</label>
                <input
                    type="text"
                    id="username"
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    required />

                <label htmlFor="pass">Password:</label>
                <input
                    type="password"
                    id="pass"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required />
                <p className="non-valid" id="error">{loginError}</p>

                <button type="submit">Log In</button>

                <p>
                    Don't have an account? <Link to="/register" id="toggle-register">Sign Up</Link>
                </p>
            </form>
        </div>
    );
}

export default LoginForm;