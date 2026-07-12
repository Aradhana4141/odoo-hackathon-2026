"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import PocketBase from "pocketbase";
import { useEffect, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import { getCurrentUserAction } from "./header.action";

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL || "https://db-clarity.arinji.com";
const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBMaplVy8boQ_Fb8BnRjeASD4nwNUZvgjbpgMvew9cDZ5qxvaJ18tSXr0g6dFw_ptW1EZe_pmOQQ0B4EyHlApmOoiFQdH1U_-k5KGPgRQqLUbL-vjheEpcsu8a2Jxbudx02MKsOdiEX1wKEeqjOzV41vvXteWQgcJ6ESgNOhyBAwuR1AKhkEG4F2OWCfPo3343dnnItiVVXEu01gVDoHP3aLbxOY79veGFNVR_RqEaqXsqSgiuNeOk_G74Lu5g59OghKxtMY3hvDWww";

export function Header() {
  const [user, setUser] = useState<components["schemas"]["UserSummary"] | null>(
    null,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const data = await getCurrentUserAction();
      if (data) {
        setUser(data);

        // Fetch full user record to retrieve 'avatar' attribute via PB client SDK
        try {
          const pb = new PocketBase(PB_URL);
          const record = await pb.collection("users").getOne(data.id);
          if (record.avatar) {
            setAvatarUrl(
              `${PB_URL}/api/files/users/${record.id}/${record.avatar}`,
            );
          }
        } catch (err) {
          console.error("Failed to load user avatar in header:", err);
        }
      }
    }
    loadUser();
  }, []);

  return (
    <header className="glass-panel fixed top-4 right-4 left-4 z-30 flex h-16 items-center justify-end rounded-full px-8 transition-all focus-within:ring-2 focus-within:ring-primary/50 md:left-72">
      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/40 transition-all hover:bg-white/60">
          <Bell className="h-5 w-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full border border-white bg-error" />
        </button>

        <div className="mx-2 h-8 w-px bg-outline-variant/30" />

        <div className="flex cursor-pointer items-center gap-3 rounded-full p-1 pr-4 transition-all hover:bg-white/40">
          <div className="hidden text-right sm:block">
            <p className="font-bold text-on-surface text-sm">
              {user?.name || "TransitOps User"}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              {user?.role || "Staff"}
            </p>
          </div>
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-surface-variant shadow-sm">
            <Image
              src={avatarUrl || DEFAULT_AVATAR}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
