import { create } from "zustand";
import { axiosInstance } from "./lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  users: [],
  conversations: [],
  messages: [],
  selectedUser: null,
  isUsersLoading: false,
  isConversationsLoading: false,
  isMessagesLoading: false,
  isSending: false,

  getUsers: async (isSilent = false) => {
    if (!isSilent) set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contects");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      if (!isSilent) set({ isUsersLoading: false });
    }
  },

  getConversations: async (isSilent = false) => {
    if (!isSilent) set({ isConversationsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      const sortedConversations = res.data.sort((a, b) => {
        const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
        const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
        return timeB - timeA;
      });
      set({ conversations: sortedConversations });
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      if (!isSilent) set({ isConversationsLoading: false });
    }
  },

  getMessages: async (userId, isSilent = false) => {
    if (!isSilent) set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      if (!isSilent) set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, conversations } = get();
    if (!selectedUser) return;
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const newMessage = res.data;
      set({ messages: [...messages, newMessage] });

      // Update conversations locally and sort to ensure the newest is always at the top
      const updatedConversations = [...conversations];
      const convIndex = updatedConversations.findIndex(c => c._id === selectedUser._id);
      
      const msgText = newMessage.text || (newMessage.image ? "Sent an image" : "");
      const msgTime = newMessage.createdAt;

      if (convIndex !== -1) {
        const conversation = { ...updatedConversations[convIndex] };
        conversation.lastMessage = msgText;
        conversation.lastMessageTimestamp = msgTime;
        updatedConversations[convIndex] = conversation;
      } else {
        const newConv = {
          ...selectedUser,
          lastMessage: msgText,
          lastMessageTimestamp: msgTime,
          unreadCount: 0
        };
        updatedConversations.push(newConv);
      }

      // Sort conversations so that the newest message is at the top
      updatedConversations.sort((a, b) => {
        const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
        const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
        return timeB - timeA;
      });

      set({ conversations: updatedConversations });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      const filteredMessages = get().messages.filter(msg => msg._id !== messageId);
      set({ messages: filteredMessages });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  editMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text });
      const updatedMessages = get().messages.map(msg => msg._id === messageId ? res.data : msg);
      set({ messages: updatedMessages });
      toast.success("Message updated");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update message");
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser, messages: [] });
    if (selectedUser) {
      get().getMessages(selectedUser._id);
      
      // Reset unread count for this user in conversations list
      const { conversations } = get();
      const updatedConversations = conversations.map(c => {
        if (c._id === selectedUser._id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });
      set({ conversations: updatedConversations });
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Avoid duplicate listeners
    socket.off("getMessage");

    socket.on("getMessage", (newMessage) => {
      const { selectedUser, messages, conversations } = get();

      // Check if this message is for the current active conversation
      const isFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;

      if (isFromSelectedUser) {
        set({ messages: [...messages, newMessage] });
      }

      // Update the conversations list in real-time
      const senderId = newMessage.senderId;
      const receiverId = newMessage.receiverId;
      const partnerId = senderId === useAuthStore.getState().authUser._id ? receiverId : senderId;

      const updatedConversations = [...conversations];
      const convIndex = updatedConversations.findIndex(c => c._id === partnerId);

      const msgText = newMessage.text || (newMessage.image ? "Sent an image" : "");
      const msgTime = newMessage.createdAt;

      if (convIndex !== -1) {
        const conversation = { ...updatedConversations[convIndex] };
        conversation.lastMessage = msgText;
        conversation.lastMessageTimestamp = msgTime;

        // Increment unread count if the receiver is not currently viewing that conversation
        if (!isFromSelectedUser) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        updatedConversations[convIndex] = conversation;
      } else {
        // If the partner user is not currently in conversations, try to find them in the loaded contacts
        const users = get().users;
        const contactUser = users.find(u => u._id === partnerId);
        
        if (contactUser) {
          const newConv = {
            ...contactUser,
            lastMessage: msgText,
            lastMessageTimestamp: msgTime,
            unreadCount: isFromSelectedUser ? 0 : 1
          };
          updatedConversations.push(newConv);
        } else {
          // Fallback: reload conversations from backend
          get().getConversations(true);
          return;
        }
      }

      // Sort conversations so that the newest message is always at the top
      updatedConversations.sort((a, b) => {
        const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
        const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
        return timeB - timeA;
      });

      set({ conversations: updatedConversations });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("getMessage");
    }
  },
}));
