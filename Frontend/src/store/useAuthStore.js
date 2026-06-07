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
            alert("Account created successfully!");
            return true;
        } catch (error) {
            console.log("Error in signup action:", error);
            alert(error.response?.data?.message || "Signup failed");
            return false;
        }
    },

    login: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            alert("Logged in successfully!");
            return true;
        } catch (error) {
            console.log("Error in login action:", error);
            alert(error.response?.data?.message || "Login failed");
            return false;
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
        } catch (error) {
            console.log("Error in logout action:", error);
            alert(error.response?.data?.message || "Logout failed");
        }
    },
}));

