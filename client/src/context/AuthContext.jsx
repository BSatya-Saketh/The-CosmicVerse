import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api/auth';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('fsc-token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user details if token exists on load
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_URL}/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setUser(res.data.user);
                } else {
                    handleLogout();
                }
            } catch (err) {
                // If token is invalid or server is down, log out
                if (err.response && err.response.status === 401) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            if (res.data.success) {
                localStorage.setItem('fsc-token', res.data.token);
                setToken(res.data.token);
                setUser(res.data.user);
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to authenticate user');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/register`, { email, password });
            if (res.data.success) {
                localStorage.setItem('fsc-token', res.data.token);
                setToken(res.data.token);
                setUser(res.data.user);
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('fsc-token');
        setToken(null);
        setUser(null);
        setError(null);
    };

    const logout = () => {
        handleLogout();
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            login,
            register,
            logout,
            setError
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
