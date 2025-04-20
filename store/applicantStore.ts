import { create } from "zustand";
import { persist, StateStorage } from "zustand/middleware";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "SUPER_ADMIN" | "APPLICANT" | string;
}

interface StoreState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  invoiceNumber: string | null;
  setUser: (
    userData: User,
    accessToken?: string,
    refreshToken?: string
  ) => void;
  clearUser: () => void;
  setPaymentDetails: (details: { invoiceNumber: string }) => void;
  isAdmin: () => boolean;
  isApplicant: () => boolean;
}

const useUserStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      invoiceNumber: null,
      setUser: (userData, accessToken, refreshToken) => {
        set({
          user: userData,
          ...(accessToken && { accessToken }),
          ...(refreshToken && { refreshToken }),
        });
      },
      clearUser: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          invoiceNumber: null,
        });
      },
      setPaymentDetails: (details) => {
        set({
          invoiceNumber: details.invoiceNumber,
        });
      },
      isAdmin: () => {
        const user = get().user;
        return user?.role === "SUPER_ADMIN";
      },
      isApplicant: () => {
        const user = get().user;
        return user?.role === "APPLICANT";
      },
    }),
    {
      name: "user-storage",
    }
  )
);

export default useUserStore;
