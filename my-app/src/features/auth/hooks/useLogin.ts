
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      setUser(data.user);
    },
  });
};
