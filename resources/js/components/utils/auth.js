export const getAuth = () => {
    const auth = JSON.parse(localStorage.getItem('auth'));

    if (!auth || !auth.expires_at) return null;

    const now = Date.now();
    if (now > auth.expires_at) {
        // Token expired
        logoutUser();
        return null;
    }

    return auth;
};

export const saveAuth = (auth, isRefresh = true) => {
    // Set expiry timestamp based on Laravel's token TTL (e.g., 1 hour = 3600s)
    const expiresIn = auth.expires_in || 3600 * 24; // fallback if not provided
    auth.expires_at = Date.now() + expiresIn * 1000;

    localStorage.setItem('auth', JSON.stringify(auth));

    if (isRefresh) {
        window.location.href = `${window.location.origin}/${auth.user?.role == 1 ? 'admin' : 'user'}/dashboard`;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('auth');
    window.location.href = window.location.origin;
};