import { LoginForm } from "./login-form.client";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full">
      <div className="mesh-bg relative hidden w-1/2 items-center justify-center overflow-hidden p-10 lg:flex">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        <div className="relative z-10 flex h-full w-full max-w-lg flex-col justify-between">
          <div className="font-bold text-3xl text-primary tracking-tight">
            TransitOps
          </div>
          <div className="space-y-6">
            <h1 className="font-extrabold text-5xl text-on-surface leading-tight tracking-tight">
              Orchestrate
              <br />
              Global Movement.
            </h1>
            <p className="max-w-md text-lg text-on-surface-variant">
              The premium logistics platform for high-performance fleets and
              global supply chains. Weightless efficiency, grounded in data.
            </p>
          </div>
          <div className="opacity-40">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="4" className="fill-primary" />
              <circle cx="180" cy="50" r="6" className="fill-secondary" />
              <circle cx="100" cy="180" r="5" className="fill-primary" />
              <path
                d="M20 20C60 60 140 20 180 50"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-outline-variant"
              />
              <path
                d="M180 50C160 120 120 160 100 180"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-outline-variant"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative z-20 flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 md:p-10">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-6 font-bold text-2xl text-primary lg:hidden">
              TransitOps
            </div>
            <h2 className="mb-2 font-bold text-2xl text-on-surface">
              Sign in to TransitOps
            </h2>
            <p className="text-on-surface-variant text-sm">
              Enter your credentials to access the command center.
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant/60 text-xs uppercase">
              © 2026 TransitOps.{" "}
              <a href="#" className="transition-colors hover:text-primary">
                Privacy
              </a>{" "}
              ·{" "}
              <a href="#" className="transition-colors hover:text-primary">
                Terms
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
