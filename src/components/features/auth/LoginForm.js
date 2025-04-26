import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForm.css';

function LoginForm() {
    const [login, setLogin] = useState('');
    const [loginError, setLoginError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLoginChange = e => {
        setLogin(e.target.value);

        if (e.target.value.length === 0) {
            setLoginError('Login is required.');
        }
        else {
            setLoginError('');
        }

        setGeneralError('');

    }

    const handlePasswordChange = e => {
        setPassword(e.target.value);

        if (e.target.value.length === 0) {
            setPasswordError('Password is required.');
        }
        else {
            setPasswordError('');
        }
        setGeneralError('');

    }

    const handleSubmit = async e => {
        e.preventDefault();

        setGeneralError('')
        setIsLoading(true);

        let isValid = true;

        if (loginError || passwordError) {
            isValid = false;
        }

        if (!isValid) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({ login, password }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Login successful', data);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);

                navigate('/chat')
            } else {
                setGeneralError(data.message || 'Login failed');
                console.error('Login failed:', data);
            }
        } catch (err) {
            setGeneralError('Network error. Retry');
            console.error('Error during fetch:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="login-form">
            <form method="post" className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Login:</label>
                <input
                    type="text"
                    id="username"
                    value={login}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                    required />
                {loginError && <p className="non-valid">{loginError}</p>}


                <label htmlFor="pass">Password:</label>
                <input
                    type="password"
                    id="pass"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    required />

                {passwordError && <p className="non-valid" >{passwordError}</p>}
                {generalError && <p className="non-valid" >{generalError}</p>}


                <button type="submit" disabled={isLoading}>Log In</button>

                <p>
                    Don't have an account? <Link to="/register" id="toggle-register">Sign Up</Link>
                </p>
            </form>
        </div>
    );
}

export default LoginForm;