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

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contects");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getConversations: async () => {
    set({ isConversationsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ conversations: res.data });
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      set({ isConversationsLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
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

  setSelectedUser: (selectedUser) => {
    set({ selectedUser, messages: [] });
    if (selectedUser) {
      get().getMessages(selectedUser._id);
    }
  },
}));
