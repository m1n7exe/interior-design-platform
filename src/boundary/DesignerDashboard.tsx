
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthController } from "@/controller/AuthController";

type Props = {
  designerName: string;
  designerEmail: string;
};

type Tab = "Overview" | "My Projects" | "Enquiries" | "Portfolio" | "Profile";

const tabs: { name: Tab; icon: string }[] = [
  { name: "Overview", icon: "◫" },
  { name: "My Projects", icon: "▦" },
  { name: "Enquiries", icon: "✉" },
  { name: "Portfolio", icon: "▧" },
  { name: "Profile", icon: "○" },
];

export default function DesignerDashboard({
  designerName,
  designerEmail,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const controller = new AuthController();
      await controller.logout();
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8fc] text-[#30283b]">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 border-b border-[#e8e0f0] bg-[#eee7f8]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8c8ee] text-xl">
              ✳
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Atelier
              </h1>
              <p className="text-xs text-[#786a8a]">
                Designer workspace
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#e1d6ed] bg-white/70 px-4 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#86a98b]" />
            <span className="text-sm text-[#665774]">
              Interior Designer
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-xl border border-[#d8c9e7] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-[#f8f4fc] disabled:opacity-50"
          >
            {loggingOut ? "Signing out..." : "Log out"}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] md:grid-cols-[235px_1fr]">
        {/* Sidebar */}
        <aside className="border-b border-[#eee7f3] bg-white p-4 md:min-h-[calc(100vh-73px)] md:border-b-0 md:border-r md:p-6">
          <div className="mb-6 rounded-2xl bg-[#f5effb] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfd0f0] text-lg font-bold text-[#604c7a]">
              {designerName.charAt(0).toUpperCase()}
            </div>

            <p className="mt-3 font-semibold">{designerName}</p>
            <p className="mt-1 break-all text-xs text-[#8b7d98]">
              {designerEmail}
            </p>
          </div>

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a194af]">
            Workspace
          </p>

          <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === tab.name
                    ? "bg-[#e9def6] text-[#5d467a]"
                    : "text-[#786d84] hover:bg-[#f8f4fb]"
                }`}
              >
                <span className="w-5 text-center text-lg">
                  {tab.icon}
                </span>
                {tab.name}
              </button>
            ))}
          </nav>

          <div className="mt-8 hidden rounded-2xl border border-[#eee5f4] p-4 md:block">
            <p className="text-sm font-semibold">Design tip</p>
            <p className="mt-2 text-xs leading-5 text-[#85778f]">
              Keep your project details and design milestones updated
              so customers can follow their renovation progress.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 p-5 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-[#9a87b1]">
              YOUR WORKSPACE / {activeTab.toUpperCase()}
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {activeTab === "Overview"
                ? `Welcome back, ${designerName.split(" ")[0]}`
                : activeTab}
            </h2>

            <p className="mt-2 text-sm text-[#8b8196]">
              {activeTab === "Overview"
                ? "A calm space to organise your designs and projects."
                : `Manage your ${activeTab.toLowerCase()} in one place.`}
            </p>
          </div>

          {activeTab === "Overview" && (
            <>
              {/* Welcome banner */}
              <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#e8def5] p-6 sm:p-8">
                <div className="relative z-10 max-w-xl">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#856c9e]">
                    YOUR CREATIVE SPACE
                  </p>

                  <h3 className="text-2xl font-bold leading-snug sm:text-3xl">
                    Good design starts with a good plan.
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-6 text-[#766684]">
                    Organise your projects, keep track of customer
                    enquiries and bring every space to life.
                  </p>

                  <button
                    onClick={() => setActiveTab("My Projects")}
                    className="mt-6 rounded-xl bg-[#695184] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#563e70]"
                  >
                    View my projects →
                  </button>
                </div>

                <div className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 rounded-full border-[30px] border-white/30 sm:right-10 sm:top-0" />
                <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-[#d2c0e8]/60" />
              </section>

              {/* Summary cards */}
              <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: "Active Projects",
                    value: "—",
                    note: "Connect project records",
                    icon: "▦",
                    color: "bg-[#eee5fa]",
                  },
                  {
                    title: "New Enquiries",
                    value: "—",
                    note: "Connect customer requests",
                    icon: "✉",
                    color: "bg-[#e5f0e8]",
                  },
                  {
                    title: "Completed",
                    value: "—",
                    note: "Based on project status",
                    icon: "✓",
                    color: "bg-[#f9eada]",
                  },
                  {
                    title: "Portfolio Items",
                    value: "—",
                    note: "Connect portfolio records",
                    icon: "▧",
                    color: "bg-[#f7e5ed]",
                  },
                ].map((stat) => (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-[#eee7f3] bg-white p-5 shadow-sm shadow-[#4c315b]/[0.03]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#82758f]">
                        {stat.title}
                      </p>
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${stat.color}`}
                      >
                        {stat.icon}
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-bold">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs text-[#a094ab]">
                      {stat.note}
                    </p>
                  </div>
                ))}
              </section>

              {/* Recent projects and quick actions */}
              <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-2xl border border-[#eee7f3] bg-white p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Recent Projects</h3>
                      <p className="mt-1 text-sm text-[#978ba2]">
                        Your latest design work
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("My Projects")}
                      className="text-sm font-semibold text-[#80649c] hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-6 rounded-2xl border border-dashed border-[#e4d8ee] bg-[#fcfaff] px-5 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee5fa] text-2xl">
                      ▦
                    </div>
                    <p className="mt-4 font-semibold">
                      Your projects will appear here
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#93869e]">
                      Project data has not been connected yet. Once
                      connected, you can view project names, customers
                      and progress here.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#eee7f3] bg-white p-6">
                  <h3 className="font-bold">Quick Access</h3>
                  <p className="mt-1 text-sm text-[#978ba2]">
                    Jump straight into your work
                  </p>

                  <div className="mt-5 space-y-3">
                    {[
                      {
                        title: "Manage projects",
                        desc: "View project progress",
                        tab: "My Projects" as Tab,
                        icon: "▦",
                      },
                      {
                        title: "Customer enquiries",
                        desc: "Review incoming requests",
                        tab: "Enquiries" as Tab,
                        icon: "✉",
                      },
                      {
                        title: "Update portfolio",
                        desc: "Showcase your design work",
                        tab: "Portfolio" as Tab,
                        icon: "▧",
                      },
                      {
                        title: "My profile",
                        desc: "Review your account details",
                        tab: "Profile" as Tab,
                        icon: "○",
                      },
                    ].map((item) => (
                      <button
                        key={item.tab}
                        onClick={() => setActiveTab(item.tab)}
                        className="flex w-full items-center gap-3 rounded-xl border border-[#f0eaf5] p-4 text-left transition hover:border-[#d8c5eb] hover:bg-[#fcf9ff]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1e9f9] text-lg text-[#82679e]">
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-xs text-[#978ba2]">
                            {item.desc}
                          </span>
                        </span>
                        <span className="text-[#aa9ab9]">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "My Projects" && (
            <EmptySection
              icon="▦"
              title="Your projects"
              description="Projects assigned to you will appear here. Connect a projects table to enable creating, editing and tracking project progress."
            />
          )}

          {activeTab === "Enquiries" && (
            <EmptySection
              icon="✉"
              title="Customer enquiries"
              description="Customer requests will appear here when your enquiry records are connected. You can then review and update their status."
            />
          )}

          {activeTab === "Portfolio" && (
            <EmptySection
              icon="▧"
              title="Your design portfolio"
              description="Showcase completed interiors, project photographs, design styles and descriptions here once portfolio storage is connected."
            />
          )}

          {activeTab === "Profile" && (
            <section className="max-w-2xl rounded-2xl border border-[#eee7f3] bg-white p-6 sm:p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8def5] text-2xl font-bold text-[#695184]">
                {designerName.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-lg font-bold">Account information</h3>
              <p className="mt-1 text-sm text-[#978ba2]">
                Your current signed-in account details
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9a8ca7]">
                    Name
                  </p>
                  <p className="mt-2 font-medium">{designerName}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9a8ca7]">
                    Email
                  </p>
                  <p className="mt-2 break-all font-medium">
                    {designerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9a8ca7]">
                    Role
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[#e8f1e9] px-3 py-1 text-sm font-medium text-[#55765a]">
                    Interior Designer
                  </span>
                </div>
              </div>
            </section>
          )}

          <footer className="mt-10 border-t border-[#eee7f3] pt-5 text-xs text-[#a095ac]">
            Atelier Designer Workspace
          </footer>
        </main>
      </div>
    </div>
  );
}

function EmptySection({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-[#eee7f3] bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eee5fa] text-3xl text-[#80649c]">
          {icon}
        </div>

        <h3 className="mt-5 text-xl font-bold">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#8f829c]">
          {description}
        </p>
      </div>
    </section>
  );
}
