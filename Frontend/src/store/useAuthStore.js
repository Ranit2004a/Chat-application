import { create } from "zustand";
import { axiosInstance } from "./lib/axios.js";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data.user || res.data });
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
        } catch (error) {
            console.log("Error in logout action:", error);

        }
    },
}));

