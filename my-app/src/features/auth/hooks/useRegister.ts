"use client";

import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

export const useRegister = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: registerUser,

    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      setUser(data.user);
    },
  });
};