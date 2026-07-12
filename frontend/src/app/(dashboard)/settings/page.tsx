"use client";

import {
  Camera,
  ChevronDown,
  Loader2,
  ShieldAlert,
  Sliders,
} from "lucide-react";
import Image from "next/image";
import PocketBase from "pocketbase";
import { useEffect, useState } from "react";
import { getCurrentUserAction } from "@/components/layout/header.action";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL;

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [pbUser, setPbUser] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Fetch current user context
  useEffect(() => {
    async function loadUser() {
      const data = await getCurrentUserAction();
      if (data) {
        setUser(data);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      const pb = new PocketBase(PB_URL);
      pb.collection("users")
        .getOne(user.id)
        .then((record) => {
          setPbUser(record);
        })
        .catch((err) => console.error("Failed to load PB user profile:", err));
    }
  }, [user]);

  // 3. Handle file selection and upload using PB SDK
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const pb = new PocketBase(PB_URL);

      // Extract client-side token cookie to authorize update
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (token) {
        pb.authStore.save(token, null);
      }

      const formData = new FormData();
      formData.append("avatar", file);

      // Perform update on the 'users' collection
      const updatedRecord = await pb
        .collection("users")
        .update(user.id, formData);
      setPbUser(updatedRecord);
      alert("Profile photo updated successfully!");
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = pbUser?.avatar
    ? `${PB_URL}/api/files/users/${pbUser.id}/${pbUser.avatar}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="font-extrabold text-3xl text-on-surface tracking-tight">
          Settings & Access
        </h2>
        <p className="mt-1 text-on-surface-variant text-sm">
          Configure platform preferences and role-based permissions.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-4">
          {/* User Profile Card */}
          <div className="flex flex-col items-center rounded-3xl border border-white/40 bg-white/60 p-6 text-center shadow-xs backdrop-blur-xl">
            <div className="group relative mb-4">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-surface-variant shadow-md">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="User Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="font-bold text-2xl text-primary uppercase">
                    {user?.name?.substring(0, 2) || "TO"}
                  </span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-white bg-primary p-1.5 text-white shadow-md transition-transform hover:bg-primary/95 active:scale-95"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">
                {user?.name || "TransitOps User"}
              </h3>
              <p className="mt-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                {user?.role || "Staff"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xs backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-2 border-white/30 border-b pb-4">
              <Sliders className="h-4.5 w-4.5 text-primary" />
              <h3 className="font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                General Preferences
              </h3>
            </div>

            <form className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label
                  className="font-semibold text-on-surface text-xs"
                  htmlFor="depot_name"
                >
                  Primary Depot Name
                </label>
                <input
                  id="depot_name"
                  className="w-full rounded-xl border border-white/60 bg-white/40 px-4 py-2 text-on-surface text-sm shadow-inner outline-none transition-all focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/50"
                  type="text"
                  defaultValue="Central Hub Alpha"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="font-semibold text-on-surface text-xs"
                  htmlFor="currency"
                >
                  Default Currency
                </label>
                <div className="relative">
                  <select
                    id="currency"
                    defaultValue="USD"
                    className="w-full cursor-pointer appearance-none rounded-xl border border-white/60 bg-white/40 px-4 py-2 text-on-surface text-sm shadow-inner transition-all focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/50"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 text-on-surface-variant" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="font-semibold text-on-surface text-xs"
                  htmlFor="distance"
                >
                  Distance Unit
                </label>
                <div className="relative flex rounded-lg border border-white/40 bg-surface-variant/30 p-1 shadow-xs">
                  <button
                    id="distance"
                    className="grow cursor-pointer rounded-md bg-white py-1.5 text-center font-bold text-primary text-xs shadow-xs transition-all"
                    type="button"
                  >
                    Miles
                  </button>
                  <button
                    className="grow cursor-pointer rounded-md py-1.5 text-center font-semibold text-on-surface-variant text-xs transition-all hover:bg-white/40"
                    type="button"
                  >
                    Kilometers
                  </button>
                </div>
              </div>

              <div className="mt-2 border-white/30 border-t pt-4">
                <button
                  className="hover:-translate-y-0.5 w-full cursor-pointer rounded-xl bg-linear-to-r from-primary to-primary-container py-2.5 font-bold text-white text-xs shadow-lg transition-all duration-300 hover:shadow-xl"
                  type="button"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/60 shadow-xs backdrop-blur-xl xl:col-span-8">
          <div className="flex items-center justify-between border-white/30 border-b bg-white/20 p-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                Role-Based Access Control
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto p-6">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-white/30 border-b">
                  <th className="w-1/4 px-4 py-3 font-semibold text-on-surface-variant text-xs">
                    Role
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-on-surface-variant text-xs">
                    Fleet
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-on-surface-variant text-xs">
                    Drivers
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-on-surface-variant text-xs">
                    Trips
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-on-surface-variant text-xs">
                    Fuel
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-on-surface-variant text-xs">
                    Analytics
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <RBACRow
                  roleName="Fleet Manager"
                  permissions={{
                    fleet: true,
                    drivers: true,
                    trips: true,
                    fuel: true,
                    analytics: true,
                  }}
                />
                <RBACRow
                  roleName="Dispatcher"
                  permissions={{
                    fleet: true,
                    drivers: true,
                    trips: true,
                    fuel: false,
                    analytics: false,
                  }}
                />
                <RBACRow
                  roleName="Safety Officer"
                  permissions={{
                    fleet: true,
                    drivers: true,
                    trips: true,
                    fuel: false,
                    analytics: false,
                  }}
                />
                <RBACRow
                  roleName="Analyst"
                  permissions={{
                    fleet: false,
                    drivers: false,
                    trips: false,
                    fuel: true,
                    analytics: true,
                  }}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function RBACRow({
  roleName,
  permissions,
}: {
  roleName: string;
  permissions: Record<string, boolean>;
}) {
  return (
    <tr className="border-white/20 border-b transition-colors last:border-0 hover:bg-white/30">
      <td className="px-4 py-4 font-semibold text-on-surface">{roleName}</td>
      {Object.entries(permissions).map(([key, val]) => (
        <td key={key} className="px-4 py-4 text-center">
          <div className="relative inline-block w-12 select-none align-middle">
            <label className="relative inline-block h-6 w-12 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={val}
                className="peer sr-only"
              />
              <span className="block h-6 w-12 rounded-full bg-surface-variant transition-all duration-300 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-primary-container peer-checked:after:translate-x-6" />
            </label>
          </div>
        </td>
      ))}
    </tr>
  );
}
