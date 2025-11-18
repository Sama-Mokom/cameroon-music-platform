// '@/stores/auth-store.ts'
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens } from '@/types/auth'; // Assuming this import is correct

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Used for API calls, keep it separate from hydration
}

interface AuthActions {
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  // New action to manage hydration state
  setHasHydrated: (state: boolean) => void;
}

// Combine all types, including the new internal hydration state
type AuthStore = AuthState & AuthActions & {
    _hasHydrated: boolean; 
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false, // <-- NEW: Hydration flag, default false

      // Actions
      setAuth: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
        }),

      setTokens: (tokens) =>
        set({
          tokens,
        }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false, // Ensure loading is false on logout
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      // <-- NEW ACTION
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // <-- NEW PERSISTENCE OPTION
      onRehydrateStorage: () => (state) => {
        // This function runs AFTER the state has been read from storage
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);