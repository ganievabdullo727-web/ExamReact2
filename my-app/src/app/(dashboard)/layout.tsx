
import AuthGuard from "@/features/auth/components/AuthGuard";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <AuthGuard>{children}</AuthGuard>;
};
export default DashboardLayout;
