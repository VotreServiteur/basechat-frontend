export function getTokenOrRedirect(navigate, onFail) {
    const token = localStorage.getItem('token');
    if (!token) {
        if (onFail) onFail();
        navigate('/login');
        return null;
    }
    return token;
}

export function handleAuthFailure(navigate) {
    localStorage.removeItem('token');
    localStorage.removeItem('userLogin');
    localStorage.removeItem('user');
    navigate('/login');
}