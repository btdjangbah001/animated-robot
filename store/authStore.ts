import { create } from 'zustand';
import Cookies from 'js-cookie';
import axiosInstance, { setAuthTokens, clearAuthTokens } from '@/lib/axios';
import { LoginResponseDto } from '@/types/auth';
import { ApplicantOutput } from "@/types/applicant";

interface AuthState {
    user: ApplicantOutput | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    setUser: (user: ApplicantOutput | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    checkAuth: () => Promise<boolean>;
    login: (pin: string, serial: string) => Promise<LoginResponseDto>;
    logout: () => void;
}

interface AuthStore extends AuthState, AuthActions {}

const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user: user ? { ...user } : null, isAuthenticated: !!user }), // Ensure new object
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    checkAuth: async () => {
        const token = Cookies.get('accessToken');
        if (!token) {
            set({ isAuthenticated: false, user: null });
            return false;
        }
        set({ isAuthenticated: true });
        return true;
    },

    login: async (pin: string, serial: string): Promise<LoginResponseDto> => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post<LoginResponseDto>('/api/v1.0/auth/login', { pin, serial });
            const { user, accessToken, refreshToken } = response.data;

            setAuthTokens(accessToken, refreshToken);

            set({
                user: { ...user },
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            return response.data;
        } catch (error: any) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        clearAuthTokens();
        set({ user: null, isAuthenticated: false, error: null });
        if (typeof window !== 'undefined') { window.location.href = '/portal/login'; }
    }
}));

export default useAuthStore;
