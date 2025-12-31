import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Load initial state from localStorage
const loadInitialState = (): AuthState => {
  const stored = localStorage.getItem("authState");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {
        user: null,
        isAuthenticated: false,
      };
    }
  }
  return {
    user: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      // Persist to localStorage
      localStorage.setItem("authState", JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // Clear localStorage
      localStorage.removeItem("authState");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
