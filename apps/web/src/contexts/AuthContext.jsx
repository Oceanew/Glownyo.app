import { createContext, useContext, useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => pb.authStore.record || null);

  useEffect(() => {
    // Keep React state in sync with the PocketBase auth store (login / logout /
    // token refresh). The SDK calls this callback whenever the store changes.
    const onChange = () => setUser(pb.authStore.record || null);
    pb.authStore.onChange = onChange;
    return () => {
      if (pb.authStore.onChange === onChange) pb.authStore.onChange = null;
    };
  }, []);

  const login = async (email, password) => {
    const auth = await pb.collection('users').authWithPassword(email, password);
    setUser(auth.record);
    return auth.record;
  };

  const signup = async (email, password, data = {}) => {
    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      role: 'client',
      ...data,
    });
    const auth = await pb
      .collection('users')
      .authWithPassword(email, password);
    setUser(auth.record);
    return auth.record;
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  // Permanently deletes the signed-in account. Bookings are preserved for the
  // GlowNyo team because the `owner` relation on `bookings` has
  // `cascadeDelete: false` — the records remain accessible to admin/superuser
  // via the Express bookings-list route, just no longer linked to a client.
  const deleteAccount = async () => {
    const id = pb.authStore.record?.id;
    if (!id) return;
    await pb.collection('users').delete(id);
    pb.authStore.clear();
    setUser(null);
  };

  const isAuthed = !!user;

  // Provider capability: a standalone validated provider account
  // (role="provider" && validated) OR an existing client account whose
  // provider request was validated (provider_request_status="validated").
  const isProvider = !!user && (
    (user.role === 'provider' && user.validated === true) ||
    user.provider_request_status === 'validated'
  );
  const hasProviderRequest = !!user && user.provider_request_status === 'pending';
  const providerRequestRefused = !!user && user.provider_request_status === 'refused';

  // Dual-role capability: an account that genuinely holds BOTH the client
  // and the provider spaces. This is the existing-client account that was
  // granted provider access (role stays "client", provider request validated).
  // A standalone provider account (role="provider") is provider-only and does
  // NOT qualify — it must not see the space switcher.
  const isDualRole =
    !!user &&
    user.role === 'client' &&
    user.provider_request_status === 'validated';

  // Administrator capability: an account with role === 'admin' can access the
  // GlowNyo admin space (Demandes prestataires, Réservations).
  const isAdmin = !!user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthed,
        isProvider,
        isDualRole,
        isAdmin,
        hasProviderRequest,
        providerRequestRefused,
        login,
        signup,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
