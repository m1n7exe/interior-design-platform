"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthController } from "@/control/AuthController";

type Role = "CUSTOMER" | "INTERIOR_DESIGNER";

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    // Basic validation
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

    if (
      role === "INTERIOR_DESIGNER" &&
      !companyName.trim()
    ) {
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

      // Registration successful
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">
              Create an account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create your account to get started.
            </p>
          </div>

          {/* Account Type */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Account type
            </label>

            <div className="grid grid-cols-2 gap-3">

              {/* Customer */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setRole("CUSTOMER")}
                className={`rounded-lg border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  role === "CUSTOMER"
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Customer
              </button>

              {/* Interior Designer */}
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setRole("INTERIOR_DESIGNER")
                }
                className={`rounded-lg border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  role === "INTERIOR_DESIGNER"
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Interior Designer
              </button>

            </div>
          </div>

          {/* Signup Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="John Tan"
                required
                disabled={loading}
                autoComplete="name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="john@example.com"
                required
                disabled={loading}
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* Interior Designer Fields */}
            {role === "INTERIOR_DESIGNER" && (
              <div>
                <label
                  htmlFor="companyName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Company Name
                </label>

                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={companyName}
                  onChange={(event) =>
                    setCompanyName(event.target.value)
                  }
                  placeholder="Studio Design"
                  required
                  disabled={loading}
                  autoComplete="organization"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                minLength={8}
                disabled={loading}
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <p className="mt-1 text-xs text-gray-400">
                Minimum 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter your password again"
                required
                minLength={8}
                disabled={loading}
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-gray-900 hover:underline"
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}
