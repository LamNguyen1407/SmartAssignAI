import { checkAuth } from "@/services/auth.service"
import { create } from "zustand"
interface AuthState {
    user: any,
    role: string,
    name: string,
    checkAuth: () => Promise<void>,
    loading: boolean,
    logout: () => void,
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    role: "",
    name: "",
    checkAuth: async () => {
        set({ loading: true });
        try {
            const res = await checkAuth();
            set({ user: res.data.user.userId, role: res.data.user.role, name: res.data.user.name, loading: false })
        } catch (err) {
            set({ user: null, loading: false })
        }
    }
    ,
    logout: () => set({ user: null }),
}))