import { useApp } from '../context/AppContext';

export function useChat() {
  const {
    messages,
    sendMessage,
    markMessageAsRead,
    unreadCount,
    currentUser,
    usersList,
    selectedChatTransactionId,
    setSelectedChatTransactionId,
  } = useApp();

  return {
    messages,
    sendMessage,
    markMessageAsRead,
    unreadCount,
    currentUser,
    usersList,
    selectedChatTransactionId,
    setSelectedChatTransactionId,
  };
}
