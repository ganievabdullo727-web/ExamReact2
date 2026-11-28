"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvite } from "../api/invite.api";

export const inviteQueryKey = (token: string) => ["workspace-invite", token] as const;

export const useInvite = (token: string) => useQuery({
  queryKey: inviteQueryKey(token),
  queryFn: ({ signal }) => getInvite(token, signal),
  gcTime: 0,
  retry: false,
});
