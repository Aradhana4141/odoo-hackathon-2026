import { cookies } from "next/headers";
import { Header } from "@/components/layout/header.client";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value || null;
  return (
    <>
      <Sidebar userRole={role} />
      <Header />
      <main className="min-h-screen flex-1 px-4 pt-28 pb-10 md:ml-72 md:px-8">
        {children}
      </main>
    </>
  );
}
