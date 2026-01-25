import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const storedRole = await AsyncStorage.getItem("userRole");

        if (token) setSession({ access_token: token });
        if (storedRole) setRole(storedRole);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (sessionData, userRole) => {
    setSession(sessionData);
    setRole(userRole);

    await AsyncStorage.setItem(
      "access_token",
      sessionData.access_token
    );
    await AsyncStorage.setItem("userRole", userRole);
  };

  const logout = async () => {
    setSession(null);
    setRole(null);
    await AsyncStorage.multiRemove(["access_token", "userRole"]);
  };

  return (
    <AuthContext.Provider
      value={{ session, role, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
