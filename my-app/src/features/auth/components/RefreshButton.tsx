
"use client";

import { useRefreshToken } from "../hooks/useRefreshToken";

 const RefreshButton = () =>  {
  const refreshMutation = useRefreshToken();

  return (
    <div>
      <button
        onClick={() => refreshMutation.mutate()}
        disabled={refreshMutation.isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white"
      >
        {refreshMutation.isPending
          ? "Refreshing..."
          : "Refresh Token"}
      </button>

      {refreshMutation.isSuccess && (
        <p>Token нав шуд ✅</p>
      )}

      {refreshMutation.isError && (
        <p>Хатогӣ ҳангоми Refresh!</p>
      )}
    </div>
  );
}

export default RefreshButton