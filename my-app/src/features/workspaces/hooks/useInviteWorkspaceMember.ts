"use client";

import { useMutation } from "@tanstack/react-query";
import { inviteWorkspaceMember, type InviteWorkspaceMemberData } from "../api/workspace.api";

export const useInviteWorkspaceMember = (slug: string) =>
  useMutation({
    mutationFn: (invite: InviteWorkspaceMemberData) => inviteWorkspaceMember(slug, invite),
  });
