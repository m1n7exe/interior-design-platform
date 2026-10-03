
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // AuthController will go here later.
    console.log({
      email,
      password,
    });
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
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="john@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3.5 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white"
                />
              </div>

              {/* Password */}
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
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3.5 text-sm text-[#1c1c1a] outline-none transition placeholder:text-black/30 focus:border-black/40 focus:bg-white"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#1c1c1a] px-4 py-3.5 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black"
              >
                Log In →
              </button>
            </form>

            {/* Signup Link */}
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
