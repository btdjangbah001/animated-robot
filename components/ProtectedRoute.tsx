"use client";

import {ReactNode, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import useAuthStore from "@/store/authStore";
import {Loader2} from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuth = await checkAuth();
        if (!isAuth) {
          router.push("/portal/login");
        }
      } catch (error) {
        router.push("/portal/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [checkAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-800" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
