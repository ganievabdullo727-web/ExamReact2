
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../api/auth.api";
import { queryKeys } from "@/shared/api/query-keys";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data);
    },
  });
};
