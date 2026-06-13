import { create } from "zustand";
import { axiosInstance } from "./lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "/"

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isLoggingOut: false,
    isSigningUp: false,
    isUpdatingProfile: false,
    socket: null,
    onlineUsers: [],


    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data.user || res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error checking auth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account Created Successfully!")
            return true;
        } catch (error) {
            console.log("Error in signup action:", error);

            return false;
        }
    },

    login: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in Successfully!")
            get().connectSocket();
            return true;
        } catch (error) {
            console.log("Error in login action:", error);

            return false;
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out Successfully!");
            get().disconnectSocket();
            return true;
        } catch (error) {
            console.log("Error in logout action:", error);

        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully!");
            return true;
        } catch (error) {
            console.log("Error in updateProfile action:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
            return false;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io({
            withCredentials: true,
        });

        socket.connect();
        set({ socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },
}));

