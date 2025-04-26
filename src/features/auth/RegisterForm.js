import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthForm.css';

function RegisterForm() {

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [repeatPasswordError, setRepeatPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');


    const handleLoginChange = e => {
        setLogin(e.target.value);
        if (e.target.value.trim().length < 3) {
            setLoginError("Should be at least 3 symbols");
        } else if (e.target.value.startsWith(" ")) {
            setLoginError("Should not start with a space");
        } else {
            setLoginError("");
        }
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
    };

    const handleRepeatPasswordChange = e => {
        setRepeatPassword(e.target.value);
        if (password !== e.target.value) {
            setRepeatPasswordError("Passwords do not match");
        } else {
            setRepeatPasswordError("");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let isValid = true;
        if (loginError || passwordError || repeatPasswordError) {
            isValid = false;
            if (login.trim().length < 3) setLoginError("Should be at least 3 symbols");
            if (login.startsWith(" ")) setLoginError("Should not start with a space");
            if (password.length < 6) setPasswordError("Password must be at least 6 characters");
            if (password !== repeatPassword) setRepeatPasswordError("Passwords do not match");
        }

        if (isValid) {
            console.log('Registration data:', { login, password });
        }
    };

    return (

        <div id="register-form">
            <form method="post" className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Login:</label>
                <input
                    id="username"
                    type="text"
                    value={login}
                    onChange={handleLoginChange}
                    required />
                <p className="non-valid" id="user-error">{loginError}</p>
                
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required />
                <p className="non-valid" id="password-error">{passwordError}</p>

                <label htmlFor="repeat-pass">Repeat password:</label>
                <input
                    id="repeat-pass"
                    type="password"
                    value={repeatPassword}
                    onChange={handleRepeatPasswordChange}
                    required />
                <p className="non-valid" id="repeat-error">{repeatPasswordError}</p>

                <button type="submit">Sign Up</button>

                <p>
                    Already have an account? <Link to="/login" id="toggle-login">Log in</Link>
                </p>
            </form>
        </div>
    );
}

export default RegisterForm;