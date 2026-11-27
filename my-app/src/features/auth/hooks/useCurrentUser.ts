
"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMe } from "../api/auth.api";
import { queryKeys } from "@/shared/api/query-keys";
import { useAuthStore } from "../store/auth.store";

export const useCurrentUser = () => {

  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMe,
     retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
};
