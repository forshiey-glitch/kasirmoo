import { useApp } from '../context/AppContext';

export function useAuth() {
  const { currentUser, login, logout, switchUser, usersList } = useApp();

  return {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: currentUser?.role === 'admin',
    isKasir: currentUser?.role === 'kasir',
    login,
    logout,
    switchUser,
    usersList,
  };
}
