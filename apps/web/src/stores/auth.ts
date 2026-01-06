import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signIn,
  signOut,
  signUp,
  getCurrentUser,
  type SignUpInput,
} from "aws-amplify/auth";

interface User {
  userId: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        console.log("🔐 Starting login for:", email);
        set({ isLoading: true });
        try {
          // Primero intentar cerrar sesión existente si hay una
          try {
            console.log("🧹 Attempting to clear existing session...");
            await signOut({ global: true });
            console.log("✅ Existing session cleared");
          } catch {
            console.log("ℹ️ No existing session to clear");
            // Ignorar si no hay sesión previa
          }

          console.log("🔑 Signing in...");
          await signIn({ username: email, password });
          console.log("✅ Sign in successful");

          console.log("👤 Getting current user...");
          const currentUser = await getCurrentUser();
          console.log("✅ Current user retrieved:", currentUser);

          set({
            user: {
              userId: currentUser.userId,
              email: email,
              username: currentUser.username,
            },
            isAuthenticated: true,
            isLoading: false,
          });

          console.log("✅ Auth state updated successfully");
        } catch (error) {
          console.error("❌ Login failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          await signUp({
            username: email,
            password,
            options: {
              userAttributes: {
                email,
              },
            },
          } as SignUpInput);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await signOut({ global: true });
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error("Logout failed:", error);
          // Forzar logout local incluso si falla
          set({ user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        console.log("🔍 Checking authentication status...");
        set({ isLoading: true });
        try {
          const currentUser = await getCurrentUser();
          console.log("✅ User is authenticated:", currentUser);
          set({
            user: {
              userId: currentUser.userId,
              email: currentUser.signInDetails?.loginId || "",
              username: currentUser.username,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.log("ℹ️ User is not authenticated:", error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
