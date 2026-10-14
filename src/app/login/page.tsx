
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthController } from "@/controller/AuthController";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      // 1. Authenticate the user.
      const controller = new AuthController();
      const user = await controller.login(email, password);

      if (!user) {
        setError("Invalid email or password.");
        return;
      }


      // 2. Fetch the user's role from the database.
      const supabase = createClient();

      console.log("Authenticated user ID:", user.id);

      const {
        data: profile,
        error: profileError,
        status,
        statusText,
      } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      console.log(
        "Profile query result:",
        JSON.stringify({
          profile,
          error: profileError
            ? {
                message: profileError.message,
                code: profileError.code,
                details: profileError.details,
                hint: profileError.hint,
              }
            : null,
          status,
          statusText,
        }, null, 2)
      );

      if (profileError) {
        setError(`Role lookup failed: ${profileError.message}`);
        return;
      }

      if (!profile) {
        setError("No profile was found for this account in public.users.");
        return;
      }

      // 3. Redirect according to the role stored in public.users.
      const role = profile.role?.toUpperCase();

      switch (role) {
        case "ADMIN":
          router.replace("/admin");
          break;

        case "CUSTOMER":
          router.replace("/CustomerDashboard");
          break;

        case "INTERIOR_DESIGNER":
          router.replace("/designer-dashboard");
          break;

        default:
          setError("Your account has an unrecognised role. Please contact support.");
          return;
      }

      router.refresh();
    } catch (err: unknown) {
      console.error("Login exception:", err);

      const message =
        err instanceof Error ? err.message : "Unable to log in. Please try again.";

      if (message.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email address before logging in.");
      } else {
        setError("Unable to log in. Please check your email and password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3ef] p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        {/* Visual Panel */}
        <div className="relative hidden w-1/2 overflow-hidden lg:block">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/interior-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          <div className="absolute inset-0 bg-black/40" />

          <Link
            href="/"
            className="absolute left-8 top-8 z-10 text-xl font-semibold tracking-tight text-white"
          >
            Interior.
          </Link>

          <div className="absolute bottom-10 left-8 right-8 z-10 text-white">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/60">
              Interior Design Platform
            </p>

            <h2 className="max-w-lg text-4xl font-medium leading-tight tracking-[-0.03em] xl:text-5xl">
              Inspiration is
              <br />
              just the beginning.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
              Explore beautiful spaces and connect with designers who can
              transform your ideas into reality.
            </p>
          </div>
        </div>

        {/* Login Panel */}
        <div className="flex w-full items-center justify-center px-6 py-10 md:px-12 lg:w-1/2 lg:px-16">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link
              href="/"
              className="mb-10 block text-xl font-semibold tracking-tight text-[#1c1c1a] lg:hidden"
            >
              Interior.
            </Link>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
                Welcome back
              </p>

              <h1 className="text-4xl font-medium tracking-[-0.03em] text-[#1c1c1a]">
                Welcome back.
              </h1>

              <p className="mt-3 text-sm leading-6 text-black/50">
                Log in to continue exploring inspiring spaces and designers.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[#1c1c1a]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="john@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3.5 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#1c1c1a]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-xs font-medium text-black/40 transition hover:text-black"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3.5 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1c1c1a] px-4 py-3.5 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? "Logging in..." : "Log In →"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-black/45">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-[#1c1c1a] transition hover:opacity-60"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
