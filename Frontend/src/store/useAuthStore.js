import { create } from "zustand";
import { axiosInstance } from "./lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isLoggingOut: false,
    isSigningUp: false,
    isUpdatingProfile: false,

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
        } catch (error) {
            console.log("Error in logout action:", error);

        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile photo updated successfully!");
            return true;
        } catch (error) {
            console.log("Error in updateProfile action:", error);
            toast.error(error.response?.data?.message || "Failed to update profile photo");
            return false;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
}));

