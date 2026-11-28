import { api } from "@/shared/api/client";

export type LoginData = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

export type RegisterData = {
  email: string;
  password: string;
  display_name: string;
  invite_token?: string;
};


export type UpdateProfileData = {
  display_name?: string;
  avatar_url?: string | null;
};

export type ChangePasswordData = {
  current_password: string;
  new_password: string;
};

export const loginUser = async (user: LoginData): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/v1/auth/login", user);

  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>("/v1/auth/me");

  return data;
};

export const logoutUser = async () => {
  const refresh_token = localStorage.getItem("refresh_token");

  const { data } = await api.post("/v1/auth/logout", {
    refresh_token,
  });

  return data;
};

export const refreshToken = async (): Promise<RefreshResponse> => {
  const refresh_token = localStorage.getItem("refresh_token");

  const { data } = await api.post<RefreshResponse>("/v1/auth/refresh", {
    refresh_token,
  });

  return data;
};

export const registerUser = async (user: RegisterData): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/v1/auth/register", user);

  return data;
};

export const updateProfile = async (user: UpdateProfileData): Promise<User> => {
  const { data } = await api.patch<User>("/v1/auth/me", user);
  return data;
};

export const changePassword = async (passwords: ChangePasswordData) => {
  await api.post("/v1/auth/change-password", passwords);
};
