"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../hooks/useCurrentUser";

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const { isPending, isSuccess } = useCurrentUser();

  useEffect(() => {
    if (isSuccess) {
      router.replace("/profile");
    }
  }, [isSuccess, router]);

  if (isPending || isSuccess) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
};

export default GuestGuard;
