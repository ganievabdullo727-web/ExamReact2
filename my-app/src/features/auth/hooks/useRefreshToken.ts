"use client";

import { useMutation } from "@tanstack/react-query";
import { refreshToken } from "../api/auth.api";

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshToken,

    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
    },
  });
};
