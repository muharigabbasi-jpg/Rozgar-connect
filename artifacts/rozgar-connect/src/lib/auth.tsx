import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, UserInfo } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: UserInfo | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: meData, isLoading: meLoading, isError } = useGetMe({
    query: {
      retry: false,
    }
  });

  useEffect(() => {
    if (!meLoading) {
      if (meData?.user) {
        setUserState(meData.user);
      } else if (isError) {
        setUserState(null);
      }
      setIsLoading(false);
    }
  }, [meData, meLoading, isError]);

  const setUser = (newUser: UserInfo | null) => {
    setUserState(newUser);
  };

  const logout = () => {
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
