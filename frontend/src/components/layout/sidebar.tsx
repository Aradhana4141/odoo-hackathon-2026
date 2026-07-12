"use client";

import { motion } from "framer-motion";
import {
  Fuel,
  IdCard,
  LayoutDashboard,
  LineChart,
  Route,
  Settings,
  Truck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { href: "/vehicles", icon: <Truck size={20} />, label: "Fleet" },
    { href: "/drivers", icon: <IdCard size={20} />, label: "Drivers" },
    { href: "/trips", icon: <Route size={20} />, label: "Trips" },
    { href: "/maintenance", icon: <Wrench size={20} />, label: "Maintenance" },
    { href: "/expenses", icon: <Fuel size={20} />, label: "Fuel & Expenses" },
    { href: "/analytics", icon: <LineChart size={20} />, label: "Analytics" },
  ];

  return (
    <nav className="glass-panel fixed top-4 bottom-4 left-4 z-40 hidden w-64 flex-col gap-6 rounded-xl p-6 md:flex">
      <div className="mb-2 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-primary text-xl tracking-tight">
            TransitOps
          </h1>
          <p className="font-medium text-[10px] text-on-surface-variant uppercase tracking-wider">
            Logistics Platform
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}
      </div>
      <div className="mt-auto">
        <NavItem
          href="/settings"
          icon={<Settings size={20} />}
          label="Settings"
          active={pathname === "/settings"}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-4 rounded-full px-4 py-3 text-sm transition-colors duration-300 active:scale-95 ${
        active
          ? "text-white"
          : "text-on-surface-variant hover:bg-white/40 hover:text-primary"
      }`}
    >
      {active && (
        <motion.div
          layoutId="active-nav-pill"
          className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/20"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-4">
        {icon}
        <span className="font-medium">{label}</span>
      </span>
    </Link>
  );
}
