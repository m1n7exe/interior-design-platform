
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

  useEffect(() => {
    async function loadCustomer() {
      const supabase = createClient();

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.replace("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("name, role")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profile?.role !== "CUSTOMER") {
          router.replace("/login");
          return;
        }

        setCustomerName(
          profile.name || authData.user.user_metadata?.name || "Customer"
        );
      } catch (error) {
        console.error("Unable to load customer profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [router]);

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3ef]">
        <p className="text-sm text-[#77766f]">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#1c1c1a]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white px-6 py-8 md:flex">
          <Link
            href="/"
            className="mb-12 text-2xl font-semibold tracking-tight"
          >
            Interior<span className="text-[#a58d72]">.</span>
          </Link>

          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-black/35">
            Workspace
          </p>

          <nav className="space-y-2">
            <a
              href="#overview"
              className="flex items-center gap-3 rounded-xl bg-[#f5f3ef] px-4 py-3 text-sm font-medium"
            >
              <span>⌂</span>
              Overview
            </a>

            <a
              href="#projects"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-black/55 transition hover:bg-[#f5f3ef] hover:text-black"
            >
              <span>▤</span>
              My projects
            </a>

            <a
              href="#inspiration"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-black/55 transition hover:bg-[#f5f3ef] hover:text-black"
            >
              <span>♡</span>
              Saved inspiration
            </a>

            <a
              href="#designers"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-black/55 transition hover:bg-[#f5f3ef] hover:text-black"
            >
              <span>✳</span>
              Find designers
            </a>
          </nav>

          <div className="mt-auto border-t border-black/5 pt-6">
            <div className="mb-4">
              <p className="text-sm font-medium">{customerName}</p>
              <p className="mt-1 text-xs text-black/40">
                Customer account
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-left text-sm text-black/60 transition hover:bg-[#f5f3ef] disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Sign out ↗"}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-10 lg:px-12">
          {/* Top navigation */}
          <header className="mb-10 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight md:hidden"
            >
              Interior<span className="text-[#a58d72]">.</span>
            </Link>

            <p className="hidden text-sm text-black/45 md:block">
              Your personal design space
            </p>

            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium transition hover:bg-[#ece9e2] md:hidden"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>

            <Link
              href="/"
              className="hidden text-sm text-black/55 transition hover:text-black md:block"
            >
              Back to home ↗
            </Link>
          </header>

          {/* Welcome */}
          <section id="overview" className="mb-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a58d72]">
              CUSTOMER WORKSPACE
            </p>

            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back, {customerName}.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-black/50">
              Your dream space starts here. Explore design ideas, discover
              talented interior designers, and bring your vision to life.
            </p>
          </section>

          {/* Hero card */}
          <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#292923] p-7 text-white sm:p-10 lg:p-12">
            <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-8 h-48 w-48 rounded-full border border-white/10" />

            <div className="relative max-w-xl">
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.3em] text-white/45">
                YOUR NEXT CHAPTER
              </p>

              <h2 className="max-w-lg text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                A space that feels
                <br />
                unmistakably yours.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
                Start with an idea, find the right designer, and create a
                home that reflects your lifestyle.
              </p>

              <a
                href="#designers"
                className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-[#1c1c1a] transition hover:bg-[#e9e4db]"
              >
                Explore your possibilities ↗
              </a>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-lg font-medium">Your workspace</h2>
              <p className="mt-1 text-sm text-black/45">
                Everything you need to get started.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <a
                id="projects"
                href="#project-start"
                className="group rounded-2xl border border-black/5 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eee7] text-xl">
                  ▤
                </div>

                <h3 className="font-medium">My projects</h3>

                <p className="mt-2 text-sm leading-6 text-black/45">
                  Organise your design plans and work towards your ideal
                  space.
                </p>

                <p className="mt-5 text-sm font-medium">
                  View projects <span className="transition group-hover:ml-1">↗</span>
                </p>
              </a>

              <a
                id="inspiration"
                href="#inspiration-start"
                className="group rounded-2xl border border-black/5 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eee7] text-xl">
                  ♡
                </div>

                <h3 className="font-medium">Saved inspiration</h3>

                <p className="mt-2 text-sm leading-6 text-black/45">
                  Keep your favourite interiors and ideas together in one
                  place.
                </p>

                <p className="mt-5 text-sm font-medium">
                  Explore ideas <span className="transition group-hover:ml-1">↗</span>
                </p>
              </a>

              <a
                id="designers"
                href="#designer-start"
                className="group rounded-2xl border border-black/5 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg sm:col-span-2 xl:col-span-1"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eee7] text-xl">
                  ✳
                </div>

                <h3 className="font-medium">Find a designer</h3>

                <p className="mt-2 text-sm leading-6 text-black/45">
                  Discover interior designers who can help bring your
                  vision to life.
                </p>

                <p className="mt-5 text-sm font-medium">
                  Meet designers <span className="transition group-hover:ml-1">↗</span>
                </p>
              </a>
            </div>
          </section>

          {/* Project empty state */}
          <section
            id="project-start"
            className="mb-6 rounded-2xl border border-black/5 bg-white p-6 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a58d72]">
                  YOUR PROJECTS
                </p>

                <h2 className="text-xl font-medium">
                  Make room for something beautiful.
                </h2>

                <p className="mt-2 max-w-lg text-sm leading-6 text-black/45">
                  Your project space is ready. Start exploring designers
                  and planning your next interior.
                </p>
              </div>

              <a
                href="#designer-start"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#1c1c1a] px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
              >
                Get started ↗
              </a>
            </div>
          </section>

          {/* Inspiration empty state */}
          <section
            id="inspiration-start"
            className="mb-6 rounded-2xl border border-black/5 bg-white p-6 sm:p-8"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a58d72]">
              DESIGN INSPIRATION
            </p>

            <h2 className="text-xl font-medium">
              Collect ideas you love.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Save your favourite rooms, materials, colour palettes, and
              layouts as you explore the platform.
            </p>
          </section>

          {/* Designer discovery */}
          <section
            id="designer-start"
            className="rounded-2xl border border-black/5 bg-[#eae5dc] p-6 sm:p-8"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8c755d]">
              YOUR NEXT STEP
            </p>

            <h2 className="text-xl font-medium">
              Find the right person for your space.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">
              Explore the designers on your platform and find someone
              whose style matches your vision.
            </p>

            <p className="mt-5 text-xs text-black/40">
              Designer listings and project management can be connected
              to your database as those features are implemented.
            </p>
          </section>

          <footer className="mt-10 border-t border-black/5 pt-6 text-xs text-black/35">
            Interior. — Designed around you.
          </footer>
        </section>
      </div>
    </main>
  );
}
