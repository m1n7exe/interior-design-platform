"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CustomerDashboard() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("Customer");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // ==================================================
  // CUSTOMER AUTHENTICATION
  // ==================================================

  useEffect(() => {
    async function loadCustomer() {
      const supabase = createClient();

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("users")
            .select("name, role")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError || !profile || profile.role !== "CUSTOMER") {
          router.replace("/login");
          return;
        }

        setCustomerName(
          profile.name || user.user_metadata?.name || "Customer"
        );
      } catch (error) {
        console.error("Unable to load customer profile:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [router]);

  // ==================================================
  // LOGOUT
  // ==================================================

  async function handleLogout() {
    setSigningOut(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout failed:", error.message);
        setSigningOut(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setSigningOut(false);
    }
  }

  // ==================================================
  // LOADING STATE
  // ==================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <p className="text-sm text-gray-400">
          Loading...
        </p>
      </main>
    );
  }

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#252525]">

      <div className="flex min-h-screen">

        {/* ========================================== */}
        {/* SIDEBAR */}
        {/* ========================================== */}

        <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white px-6 py-8 md:flex">

          {/* LOGO */}

          <Link
            href="/"
            className="mb-12 text-2xl font-bold tracking-tight"
          >
            space<span className="text-[#9a8065]">.</span>
          </Link>

          {/* NAVIGATION */}

          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Workspace
          </p>

          <nav className="space-y-2">

            <Link
              href="/customer/dashboard"
              className="flex items-center gap-3 rounded-xl bg-[#f5f3ef] px-4 py-3 text-sm font-medium"
            >
              <span>⌂</span>
              Overview
            </Link>

            <Link
              href="/CustomerDashboard/favourites"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-500 transition hover:bg-[#f5f3ef] hover:text-black"
            >
              <span>♡</span>
              Saved Inspiration
            </Link>

            <Link
              href="/marketplace"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-500 transition hover:bg-[#f5f3ef] hover:text-black"
            >
              <span>✳</span>
              Explore Marketplace
            </Link>

          </nav>

          {/* ACCOUNT */}

          <div className="mt-auto border-t border-black/5 pt-6">

            <p className="text-sm font-medium">
              {customerName}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Customer
            </p>

            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="mt-5 w-full rounded-xl border border-black/10 px-4 py-3 text-left text-sm text-gray-500 transition hover:bg-[#f5f3ef] disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Sign out ↗"}
            </button>

          </div>

        </aside>

        {/* ========================================== */}
        {/* MAIN CONTENT */}
        {/* ========================================== */}

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-10 lg:px-12">

          {/* HEADER */}

          <header className="mb-14 flex items-center justify-between">

            <Link
              href="/"
              className="text-xl font-bold tracking-tight md:hidden"
            >
              space<span className="text-[#9a8065]">.</span>
            </Link>

            <p className="hidden text-sm text-gray-400 md:block">
              Customer Workspace
            </p>

            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium transition hover:bg-[#f5f3ef] disabled:opacity-50 md:hidden"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>

            <Link
              href="/marketplace"
              className="hidden text-sm text-gray-500 transition hover:text-black md:block"
            >
              Marketplace ↗
            </Link>

          </header>

          {/* ======================================== */}
          {/* WELCOME */}
          {/* ======================================== */}

          <section className="mb-12">

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a8065]">
              OVERVIEW
            </p>

            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Welcome back, {customerName}.
            </h1>

          </section>

          {/* ======================================== */}
          {/* FEATURED MARKETPLACE CARD */}
          {/* ======================================== */}

          <section className="relative mb-8 overflow-hidden rounded-2xl bg-[#292923] p-8 text-white sm:p-10">

            <div className="relative z-10 max-w-lg">

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                DISCOVER
              </p>

              <h2 className="mt-5 text-3xl font-medium leading-tight sm:text-4xl">
                Find inspiration.
                <br />
                Design your space.
              </h2>

              <Link
                href="/marketplace"
                className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-[#252525] transition hover:bg-[#e9e4db]"
              >
                Explore Marketplace ↗
              </Link>

            </div>

            <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -right-4 -top-8 h-48 w-48 rounded-full border border-white/10" />

          </section>

          {/* ======================================== */}
          {/* QUICK LINKS */}
          {/* ======================================== */}

          <section>

            <div className="mb-5">

              <h2 className="text-lg font-medium">
                Your workspace
              </h2>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* SAVED INSPIRATION */}

              <Link
                href="/CustomerDashboard/favourites"
                className="group rounded-2xl border border-black/5 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eee7] text-xl">
                  ♡
                </div>

                <h3 className="font-medium">
                  Saved Inspiration
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  View your favourite projects.
                </p>

                <p className="mt-6 text-sm font-medium">
                  View saved projects
                  <span className="ml-1 transition group-hover:ml-2">
                    →
                  </span>
                </p>

              </Link>

              {/* MARKETPLACE */}

              <Link
                href="/marketplace"
                className="group rounded-2xl border border-black/5 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eee7] text-xl">
                  ✳
                </div>

                <h3 className="font-medium">
                  Find Designers
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Discover interior design projects.
                </p>

                <p className="mt-6 text-sm font-medium">
                  Explore designers
                  <span className="ml-1 transition group-hover:ml-2">
                    →
                  </span>
                </p>

              </Link>

            </div>

          </section>

          {/* ======================================== */}
          {/* FOOTER */}
          {/* ======================================== */}

          <footer className="mt-16 border-t border-black/5 pt-6">

            <p className="text-xs text-gray-400">
              space. — Interior Design Marketplace
            </p>

          </footer>

        </section>

      </div>

    </main>
  );
}