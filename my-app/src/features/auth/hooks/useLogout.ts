
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logoutUser } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: logoutUser,

    onSettled: async () => {
      await queryClient.cancelQueries();

      logout();
      queryClient.clear();

      router.replace("/login");
    },
  });
};
