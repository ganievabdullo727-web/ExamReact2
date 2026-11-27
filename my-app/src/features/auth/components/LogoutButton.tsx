"use client";

import { useLogout } from "../hooks/useLogout";

const LogoutButton = () => {
  const logoutMutation = useLogout();

 
return (
  <button
    onClick={() => logoutMutation.mutate()}
    disabled={logoutMutation.isPending}
    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 text-sm font-semibold text-red-600 shadow-sm transition-all duration-200 hover:border-red-200 hover:bg-red-100 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {logoutMutation.isPending ? "Logging out..." : "Logout"}
  </button>
);

};
export default LogoutButton;
