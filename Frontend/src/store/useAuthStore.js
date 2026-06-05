import { create } from "zustand";

const useAuthStore = create((set) => ({
    authUser: { name: "Ranit", _id: "123", age: 21 },
    isLoading: false,
    isLoggedIn: false,
    login: () => {
        console.log("we just logged in");
        set({ isLoggedin: true })
    },
    logout: () => {
        console.log("we just logged out");
        set({ isLoggedin: false })
    },

}));

export default useAuthStore;