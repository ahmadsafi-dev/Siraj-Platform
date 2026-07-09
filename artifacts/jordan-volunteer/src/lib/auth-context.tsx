import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey, useLogout, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/login");
        toast({
          title: "تم تسجيل الخروج بنجاح",
          description: "نتمنى رؤيتك قريباً",
        });
      },
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    // If not loading, and no user, and trying to access protected route
    if (!isLoading && !user && location !== "/" && location !== "/login" && location !== "/register") {
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        logout: handleLogout,
      }}
    >
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
