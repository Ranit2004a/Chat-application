import { create } from "zustand";
import { axiosInstance } from "./lib/axios.js";
import toast from "react-hot-toast";

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
      set({ conversations: res.data });
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
    const { selectedUser, messages } = get();
    if (!selectedUser) return;
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      // Refresh conversations list to keep it updated
      get().getConversations();
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
    }
  },
}));
