import GuestGuard from "@/features/auth/components/GuestGuard";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <GuestGuard>{children}</GuestGuard>;
};

export default AuthLayout;
