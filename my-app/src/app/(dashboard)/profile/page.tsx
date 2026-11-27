
import ProfileForms from "@/features/auth/components/ProfileForms";
import LogoutButton from "@/features/auth/components/LogoutButton";

export default function ProfilePage() {
 
return (
  <div className="min-h-screen bg-[#F7F8FC] px-5 py-8 sm:px-8 lg:px-12">
      <ProfileForms />
      <div className="mx-auto mt-8 flex w-full max-w-3xl flex-wrap items-center justify-between gap-5 rounded-2xl border border-red-100 bg-white px-7 py-6 shadow-[0_8px_30px_rgba(30,27,75,0.04)]">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
            </svg>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#191B35]">
              Sign out of your account
            </h3>

            <p className="mt-1 text-xs text-[#898CA3]">
              Securely end your current session
            </p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </div>
);

}
