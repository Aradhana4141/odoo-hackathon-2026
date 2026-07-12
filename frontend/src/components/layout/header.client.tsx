"use client";

import { Bell, Search } from "lucide-react";
import Image from "next/image";

export function Header() {
  return (
    <header className="glass-panel fixed top-4 right-4 left-4 z-30 flex h-16 items-center justify-between rounded-full px-8 transition-all focus-within:ring-2 focus-within:ring-primary/50 md:left-72">
      <div className="group relative max-w-md flex-1">
        <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-outline transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          placeholder="Search fleet, drivers, routes..."
          className="glass-input h-10 w-full rounded-full pr-4 pl-11 text-on-surface text-sm placeholder:text-outline/70"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/40 transition-all hover:bg-white/60">
          <Bell className="h-5 w-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full border border-white bg-error" />
        </button>

        <div className="mx-2 h-8 w-px bg-outline-variant/30" />

        <div className="flex cursor-pointer items-center gap-3 rounded-full p-1 pr-4 transition-all hover:bg-white/40">
          <div className="hidden text-right sm:block">
            <p className="font-bold text-on-surface text-sm">Manager K.</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Dispatcher
            </p>
          </div>
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMaplVy8boQ_Fb8BnRjeASD4nwNUZvgjbpgMvew9cDZ5qxvaJ18tSXr0g6dFw_ptW1EZe_pmOQQ0B4EyHlApmOoiFQdH1U_-k5KGPgRQqLUbL-vjheEpcsu8a2Jxbudx02MKsOdiEX1wKEeqjOzV41vvXteWQgcJ6ESgNOhyBAwuR1AKhkEG4F2OWCfPo3343dnnItiVVXEu01gVDoHP3aLbxOY79veGFNVR_RqEaqXsqSgiuNeOk_G74Lu5g59OghKxtMY3hvDWww"
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full border border-white/60 object-cover shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
