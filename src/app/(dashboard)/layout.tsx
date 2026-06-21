import AppLayout from "@/components/layout/AppLayout";
import { syncUser } from "@/lib/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await syncUser();
  return <AppLayout>{children}</AppLayout>;
}
