
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthController } from "@/control/AuthController";

type Role = "CUSTOMER" | "INTERIOR_DESIGNER";

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "INTERIOR_DESIGNER" && !companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      setLoading(true);

      const authController = new AuthController();

      if (role === "CUSTOMER") {
        await authController.registerCustomer(
          name.trim(),
          email.trim(),
          password
        );
      } else {
        await authController.registerInteriorDesigner(
          name.trim(),
          email.trim(),
          password,
          companyName.trim()
        );
      }

      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
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
              Create a space
              <br />
              that feels like you.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
              Discover designers, explore inspiring projects, and bring your
              next interior vision to life.
            </p>
          </div>
        </div>

        {/* Form Panel */}
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
                Get started
              </p>

              <h1 className="text-4xl font-medium tracking-[-0.03em] text-[#1c1c1a]">
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-black/50">
                Join the platform and start discovering your next space.
              </p>
            </div>

            {/* Account Type */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[#1c1c1a]">
                Account type
              </label>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f5f3ef] p-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setRole("CUSTOMER")}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                    role === "CUSTOMER"
                      ? "bg-white text-[#1c1c1a] shadow-sm"
                      : "text-black/50 hover:text-black/80"
                  }`}
                >
                  Customer
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setRole("INTERIOR_DESIGNER")}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                    role === "INTERIOR_DESIGNER"
                      ? "bg-white text-[#1c1c1a] shadow-sm"
                      : "text-black/50 hover:text-black/80"
                  }`}
                >
                  Designer
                </button>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-[#1c1c1a]"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Tan"
                  required
                  disabled={loading}
                  autoComplete="name"
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[#1c1c1a]"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="john@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* Company */}
              {role === "INTERIOR_DESIGNER" && (
                <div>
                  <label
                    htmlFor="companyName"
                    className="mb-1.5 block text-sm font-medium text-[#1c1c1a]"
                  >
                    Company Name
                  </label>

                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Studio Design"
                    required
                    disabled={loading}
                    autoComplete="organization"
                    className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[#1c1c1a]"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <p className="mt-1.5 text-xs text-black/35">
                  Minimum 8 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-[#1c1c1a]"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                  required
                  minLength={8}
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[#1c1c1a] px-4 py-3.5 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-black/45">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#1c1c1a] transition hover:opacity-60"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
