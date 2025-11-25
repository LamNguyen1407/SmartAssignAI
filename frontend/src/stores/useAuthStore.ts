import { checkAuth } from "@/services/auth.service"
import {create} from "zustand"
interface AuthState {
    user: any,
    checkAuth: () => Promise<void>,
    loading: boolean,
    logout: () => void
}


export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    checkAuth: async () => {
        set({ loading: true });
        try {
            const res = await checkAuth()
            set({ user: res.data.userId, loading: false })
        } catch(err) {
            set({ user: null, loading: false })
        }
    }
,
    logout: () => set({user: null})
}))