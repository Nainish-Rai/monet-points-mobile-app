import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTokenStore } from "@/store/tokenStore";

type AuthContextType = {
  isAuthenticated: boolean;
  initializing: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { setIsLoggedIn } = useTokenStore();

  useEffect(() => {
    const checkTokens = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        setIsAuthenticated(true);
        setIsLoggedIn(true);
      }
      setInitializing(false);
    };
    checkTokens();
  }, []);

  const login = async (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => {
    await AsyncStorage.setItem("accessToken", tokens.accessToken);
    await AsyncStorage.setItem("refreshToken", tokens.refreshToken);
    setIsAuthenticated(true);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, initializing, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
