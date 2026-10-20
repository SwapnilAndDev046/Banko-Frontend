import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../services/authApi';
import { setUnauthorizedHandler, tokenStore } from '../services/apiClient';

const AuthContext = createContext(null);
const ROLES = ['CUSTOMER', 'ADMIN'];

/**
 * status:
 *  'loading'         - a token exists and we are asking who the user is
 *  'guest'           - no valid session
 *  'ready'           - user + role resolved by the backend
 *  'role-unresolved' - token exists but the backend could not tell us the role
 *                      (e.g. the proposed GET /api/v1/auth/me is not implemented yet)
 * The role is NEVER guessed.
 */
export function AuthProvider({ children }) {
  const [status, setStatus] = useState(tokenStore.get() ? 'loading' : 'guest');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const clear = useCallback((message = '') => {
    authApi.logoutLocal();
    setUser(null);
    setError('');
    setNotice(message);
    setStatus('guest');
  }, []);

  const resolveUser = useCallback(async () => {
    setStatus('loading');
    try {
      const me = await authApi.getCurrentUser();
      if (!me || !ROLES.includes(me.role)) throw new Error('The server did not return a valid CUSTOMER or ADMIN role.');
      setUser(me);
      setError('');
      setStatus('ready');
    } catch (e) {
      if (e.status === 401) return; // the central 401 handler already cleared the session
      setUser(null);
      setError(e.message);
      setStatus('role-unresolved');
    }
  }, []);

  // Quietly re-read the profile (no loading screen), e.g. after the user edits their name.
  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.getCurrentUser();
      if (me && ROLES.includes(me.role)) setUser(me);
    } catch { /* keep the current user */ }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => clear('Your session expired. Please sign in again.'));
    if (tokenStore.get()) resolveUser();
  }, [clear, resolveUser]);

  const login = useCallback(
    async (email, password) => {
      const token = await authApi.login(email, password); // password is not kept anywhere after this call
      tokenStore.set(token);
      setNotice('');
      await resolveUser();
    },
    [resolveUser],
  );

  const value = useMemo(
    () => ({ status, user, error, notice, login, logout: () => clear(''), retry: resolveUser, refreshUser, clearWithNotice: clear }),
    [status, user, error, notice, login, clear, resolveUser, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
