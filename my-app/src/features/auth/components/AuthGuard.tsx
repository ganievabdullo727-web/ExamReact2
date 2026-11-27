"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../hooks/useCurrentUser";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {

  const router = useRouter();

  const { isPending, isError } = useCurrentUser();

  useEffect(() => {
    
    if (isError) {
      router.replace("/login");
    }
  }, [isError, router]);

  if (isPending || isError) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
};
export default AuthGuard;
