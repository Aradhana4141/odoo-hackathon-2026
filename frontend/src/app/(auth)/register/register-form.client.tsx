"use client";

import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction } from "./register.action";

const ROLES = ["Admin", "Fleet Manager", "Dispatcher", "Safety", "Finance"];

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="w-full space-y-5">
      {state?.error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-error/20 bg-error-container/80 p-4 shadow-sm backdrop-blur-md">
          <AlertCircle className="h-5 w-5 shrink-0 text-error" />
          <div>
            <p className="mb-1 font-bold text-on-error-container text-xs uppercase">
              Registration Error
            </p>
            <p className="text-on-error-container/90 text-sm">{state.error}</p>
          </div>
        </div>
      )}

      <div>
        <label
          className="mb-2 ml-1 block font-medium text-on-surface-variant text-xs uppercase"
          htmlFor="name"
        >
          Full Name
        </label>
        <div className="relative">
          <User className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-outline" />
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            required
            className="glass-input w-full rounded-xl py-3.5 pr-4 pl-12 text-on-surface placeholder:text-outline-variant"
          />
        </div>
      </div>

      <div>
        <label
          className="mb-2 ml-1 block font-medium text-on-surface-variant text-xs uppercase"
          htmlFor="email"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-outline" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            required
            className="glass-input w-full rounded-xl py-3.5 pr-4 pl-12 text-on-surface placeholder:text-outline-variant"
          />
        </div>
      </div>

      <div>
        <label
          className="mb-2 ml-1 block font-medium text-on-surface-variant text-xs uppercase"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-outline" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            className="glass-input w-full rounded-xl py-3.5 pr-12 pl-12 text-on-surface placeholder:text-outline-variant"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="-translate-y-1/2 absolute top-1/2 right-4 text-outline transition-colors hover:text-on-surface"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <label
          className="mb-2 ml-1 block font-medium text-on-surface-variant text-xs uppercase"
          htmlFor="reg-role-Admin"
        >
          Select Role
        </label>
        <div className="hide-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-surface-container-highest/50 p-1">
          {ROLES.map((role, idx) => (
            <label
              key={role}
              htmlFor={`reg-role-${role}`}
              className="flex-none cursor-pointer"
            >
              <input
                id={`reg-role-${role}`}
                type="radio"
                name="role"
                value={role}
                defaultChecked={idx === 0}
                className="peer sr-only"
              />
              <div className="whitespace-nowrap rounded-lg px-4 py-2 text-on-surface-variant text-sm transition-all hover:bg-white/40 peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm">
                {role}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href="/login"
          className="text-primary text-sm transition-colors hover:text-primary-container"
        >
          Already have an account? Sign in
        </Link>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="hover:-translate-y-0.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-br from-primary to-secondary py-4 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40 active:translate-y-0 disabled:opacity-70"
      >
        <span>{isPending ? "Creating Account..." : "Register"}</span>
        {!isPending && <ArrowRight className="h-5 w-5" />}
      </button>
    </form>
  );
}
