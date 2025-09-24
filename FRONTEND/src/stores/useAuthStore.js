    import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token) => {
    try {
      const decodedUser = jwtDecode(token);
      localStorage.setItem('authToken', token);
      set({ token, user: decodedUser, isAuthenticated: true });
    } catch (error) {
      console.error("Fallo al decodificar el token:", error);
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          set({ token, user: decodedUser, isAuthenticated: true });
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
  },
}));