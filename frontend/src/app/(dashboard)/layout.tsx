import { Header } from "@/components/layout/header.client";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="min-h-screen flex-1 px-4 pt-28 pb-10 md:ml-72 md:px-8">
        {children}
      </main>
    </>
  );
}
