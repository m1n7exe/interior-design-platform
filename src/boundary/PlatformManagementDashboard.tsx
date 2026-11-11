"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthController } from "@/controller/AuthController";

type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type ReportPeriod = "daily" | "weekly" | "monthly";

type Report = {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  newUsers: number;
  newCustomers: number;
  newDesigners: number;
  newProjects: number;
  newFavourites: number;
  newCategories: number;
  totalUsers: number;
  totalProjects: number;
  totalCategories: number;
  projectsByCategory: { category: string; count: number }[];
};

type Tab = "categories" | "reports";

const periods: { value: ReportPeriod; label: string }[] = [
  { value: "daily", label: "Daily report" },
  { value: "weekly", label: "Weekly report" },
  { value: "monthly", label: "Monthly report" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PlatformManagementDashboard() {
  const [tab, setTab] = useState<Tab>("categories");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [viewing, setViewing] = useState<Category | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Reports
  const [report, setReport] = useState<Report | null>(null);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod | null>(null);

  // Shared
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
  };

  // Search (or list) categories through the API
  const searchCategories = useCallback(async (term: string) => {
    try {
      const response = await fetch(
        `/api/platform/idp-categories?q=${encodeURIComponent(term)}`,
        { cache: "no-store" }
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setCategories(result.categories);
      } else {
        setMessage(result.error ?? "Unable to retrieve IDP categories.");
        setMessageType("error");
      }
    } catch {
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    }
  }, []);

  // Search as the user types (short delay avoids a request per keystroke)
  useEffect(() => {
    const timer = setTimeout(
      () => void searchCategories(search),
      search ? 300 : 0
    );

    return () => clearTimeout(timer);
  }, [search, searchCategories]);

  async function handleLogout() {
    setLoading(true);
    setMessage("");

    try {
      const controller = new AuthController();
      await controller.logout();

      router.replace("/login");
      router.refresh();
    } catch {
      showMessage("Unable to log out. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/platform/idp-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage("IDP category created successfully.", "success");
        setName("");
        setDescription("");
        await searchCategories(search);
      } else {
        showMessage(result.error ?? "Unable to create IDP category.", "error");
      }
    } catch {
      showMessage("A network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function viewCategory(id: string) {
    setMessage("");

    try {
      const response = await fetch(`/api/platform/idp-categories/${id}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setViewing(result.category);
      } else {
        showMessage(result.error ?? "Unable to retrieve IDP category.", "error");
      }
    } catch {
      showMessage("A network error occurred.", "error");
    }
  }

  function startEditing(category: Category) {
    setEditing(category);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
  }

  async function updateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/platform/idp-categories/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage("IDP category updated successfully.", "success");
        setEditing(null);
        await searchCategories(search);
      } else {
        showMessage(result.error ?? "Unable to update IDP category.", "error");
      }
    } catch {
      showMessage("A network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/platform/idp-categories/${category.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage("IDP category deleted successfully.", "success");
        await searchCategories(search);
      } else {
        showMessage(result.error ?? "Unable to delete IDP category.", "error");
      }
    } catch {
      showMessage("A network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function generateReport(period: ReportPeriod) {
    setLoading(true);
    setMessage("");
    setReportPeriod(period);

    try {
      const response = await fetch(`/api/platform/reports?type=${period}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setReport(result.report);
      } else {
        setReport(null);
        showMessage(result.error ?? "Unable to generate report.", "error");
      }
    } catch {
      setReport(null);
      showMessage("A network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#e5e1d8] bg-[#fcfbf9] px-4 py-3 text-sm text-[#25251f] outline-none transition placeholder:text-[#aaa69c] focus:border-[#777468] focus:ring-2 focus:ring-[#777468]/10 disabled:opacity-60";

  const labelClass = "mb-2 block text-sm font-medium text-[#4c4a42]";

  const cardClass =
    "rounded-2xl border border-[#e7e3db] bg-white shadow-[0_4px_24px_rgba(37,37,31,0.025)]";

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#25251f]">
      {/* Navigation */}
      <header className="border-b border-[#e5e1d8] bg-[#f5f3ef]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div>
            <a href="/" className="text-2xl font-semibold tracking-tight">
              Interior<span className="text-[#918c7d]">.</span>
            </a>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#8b877d]">
              Platform management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#e2ded5] bg-white px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#7c8b69]" />
              <span className="text-xs font-medium text-[#625f56]">
                Platform Management
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="rounded-full border border-[#d8d4ca] px-4 py-2.5 text-sm font-medium transition hover:bg-white disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Log out"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12">
        {/* Page heading */}
        <section className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#898477]">
              Platform overview
            </p>
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
              Manage your platform.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#777369] sm:text-base">
              Organise IDP categories and review platform activity.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-[#e2ded5] bg-white p-1">
            {(["categories", "reports"] as Tab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                aria-pressed={tab === item}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  tab === item
                    ? "bg-[#25251f] text-white"
                    : "text-[#625f56] hover:text-black"
                }`}
              >
                {item === "categories" ? "IDP categories" : "Reports"}
              </button>
            ))}
          </div>
        </section>

        {/* Status message */}
        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-4 text-sm ${
              messageType === "success"
                ? "border-[#d7e2d0] bg-[#edf3e9] text-[#3f5938]"
                : "border-[#ead3ce] bg-[#fbefed] text-[#923f35]"
            }`}
          >
            <span className="font-semibold">
              {messageType === "success" ? "OK" : "!"}
            </span>
            <p>{message}</p>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setMessage("")}
              className="ml-auto text-lg leading-none opacity-70 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        )}

        {/* IDP categories */}
        {tab === "categories" && (
          <div className="grid items-start gap-7 xl:grid-cols-[360px_minmax(0,1fr)]">
            {/* Create category */}
            <section className={`${cardClass} p-5 sm:p-7`}>
              <div className="mb-7 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1efe9] text-xl">
                  +
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Create a category
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[#898579]">
                    Add a category for organising IDPs.
                  </p>
                </div>
              </div>

              <form onSubmit={createCategory} className="space-y-5">
                <div>
                  <label htmlFor="category-name" className={labelClass}>
                    Category name
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                    disabled={loading}
                    className={inputClass}
                    placeholder="e.g. Scandinavian living rooms"
                  />
                </div>

                <div>
                  <label htmlFor="category-description" className={labelClass}>
                    Description (optional)
                  </label>
                  <textarea
                    id="category-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={500}
                    rows={4}
                    disabled={loading}
                    className={inputClass}
                    placeholder="What kind of projects belong here?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25251f] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#44443b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Create category"}
                </button>
              </form>
            </section>

            {/* Category directory */}
            <section className={`${cardClass} min-w-0 overflow-hidden`}>
              <div className="flex flex-col gap-4 border-b border-[#eeeae3] p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    IDP categories
                  </h2>
                  <p className="mt-1 text-sm text-[#898579]">
                    View, update and remove categories.
                  </p>
                </div>

                <div className="w-full md:max-w-xs">
                  <input
                    type="search"
                    aria-label="Search IDP categories"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name or description..."
                    className="w-full rounded-xl border border-[#e5e1d8] bg-[#fcfbf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#aaa69c] focus:border-[#777468] focus:ring-2 focus:ring-[#777468]/10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeae3] bg-[#fcfbf9] px-5 py-3.5 sm:px-7">
                <p className="text-xs text-[#817c71]">
                  Showing{" "}
                  <span className="font-semibold text-[#37362f]">
                    {categories.length}
                  </span>{" "}
                  {categories.length === 1 ? "category" : "categories"}
                </p>

                <button
                  type="button"
                  onClick={() => void searchCategories(search)}
                  className="text-xs font-semibold text-[#5b594f] transition hover:text-black"
                >
                  Refresh list
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-[#eeeae3] bg-white">
                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999488] sm:px-7">
                        Category
                      </th>
                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999488]">
                        Description
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999488] sm:px-7">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#f0ede7]">
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className="transition-colors hover:bg-[#fcfbf8]"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-[#37362f] sm:px-7">
                          {category.name}
                        </td>

                        <td className="max-w-xs truncate px-5 py-4 text-sm text-[#777369]">
                          {category.description ?? "No description"}
                        </td>

                        <td className="px-5 py-4 text-right sm:px-7">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void viewCategory(category.id)}
                              className="rounded-lg border border-[#e2ded5] px-3 py-2 text-xs font-medium text-[#5b594f] transition hover:bg-[#f5f3ef]"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditing(category)}
                              className="rounded-lg border border-[#e2ded5] px-3 py-2 text-xs font-medium text-[#5b594f] transition hover:bg-[#f5f3ef]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteCategory(category)}
                              disabled={loading}
                              className="rounded-lg border border-[#ead8d4] px-3 py-2 text-xs font-medium text-[#a24f43] transition hover:bg-[#fbefed] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center">
                          <p className="text-sm font-medium text-[#4c4a42]">
                            {search ? "No matching categories" : "No categories yet"}
                          </p>
                          <p className="mt-1 text-xs text-[#999488]">
                            {search
                              ? "Try another name or description."
                              : "Create your first category to get started."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Reports */}
        {tab === "reports" && (
          <section className="space-y-7">
            <div className={`${cardClass} p-5 sm:p-7`}>
              <h2 className="text-lg font-semibold tracking-tight">
                Generate a report
              </h2>
              <p className="mt-1 text-sm text-[#898579]">
                Daily covers today, weekly starts on Monday, and monthly starts
                on the 1st. All times are Singapore time.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {periods.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => void generateReport(item.value)}
                    disabled={loading}
                    className={`rounded-xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      reportPeriod === item.value
                        ? "bg-[#25251f] text-white"
                        : "border border-[#d8d4ca] hover:bg-[#f5f3ef]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {!report && (
              <div className={`${cardClass} px-6 py-16 text-center`}>
                <p className="text-sm font-medium text-[#4c4a42]">
                  {loading ? "Generating report..." : "No report generated yet"}
                </p>
                <p className="mt-1 text-xs text-[#999488]">
                  Choose a report above to review platform activity.
                </p>
              </div>
            )}

            {report && (
              <>
                <p className="text-sm text-[#777369]">
                  {periods.find((item) => item.value === report.period)?.label}:{" "}
                  {formatDate(report.startDate)} to {formatDate(report.endDate)}
                </p>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <StatCard
                    label="New accounts"
                    value={report.newUsers}
                    description={`${report.newCustomers} customers, ${report.newDesigners} designers`}
                  />
                  <StatCard
                    label="New projects"
                    value={report.newProjects}
                    description="Added by interior designers"
                  />
                  <StatCard
                    label="New favourites"
                    value={report.newFavourites}
                    description="Saved by customers"
                  />
                  <StatCard
                    label="New categories"
                    value={report.newCategories}
                    description="Created this period"
                  />
                  <StatCard
                    label="Total accounts"
                    value={report.totalUsers}
                    description="All registered users"
                  />
                  <StatCard
                    label="Total projects"
                    value={report.totalProjects}
                    description={`${report.totalCategories} categories in use`}
                  />
                </div>

                <div className={`${cardClass} p-5 sm:p-7`}>
                  <h3 className="text-lg font-semibold tracking-tight">
                    New projects by category
                  </h3>

                  {report.projectsByCategory.length === 0 ? (
                    <p className="mt-3 text-sm text-[#898579]">
                      No projects were added in this period.
                    </p>
                  ) : (
                    <ul className="mt-4 divide-y divide-[#f0ede7]">
                      {report.projectsByCategory.map((item) => (
                        <li
                          key={item.category}
                          className="flex items-center justify-between py-3 text-sm"
                        >
                          <span className="text-[#37362f]">{item.category}</span>
                          <span className="font-semibold">{item.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-[#e4e0d7] pt-5 text-xs text-[#999488] sm:flex-row">
          <p>Interior. - Platform management dashboard</p>
          <p>IDP categories and reports</p>
        </footer>
      </div>

      {/* View category */}
      {viewing && (
        <Modal title="Category details" onClose={() => setViewing(null)}>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs text-[#999488]">Name</dt>
              <dd className="mt-1 font-medium">{viewing.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#999488]">Description</dt>
              <dd className="mt-1 text-[#4c4a42]">
                {viewing.description ?? "No description"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#999488]">Created</dt>
              <dd className="mt-1 text-[#4c4a42]">{formatDate(viewing.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#999488]">Last updated</dt>
              <dd className="mt-1 text-[#4c4a42]">{formatDate(viewing.updatedAt)}</dd>
            </div>
          </dl>
        </Modal>
      )}

      {/* Edit category */}
      {editing && (
        <Modal title="Update category" onClose={() => setEditing(null)}>
          <form onSubmit={updateCategory} className="space-y-5">
            <div>
              <label htmlFor="edit-name" className={labelClass}>
                Category name
              </label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
                maxLength={100}
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="edit-description" className={labelClass}>
                Description (optional)
              </label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                maxLength={500}
                rows={4}
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-[#d8d4ca] px-5 py-3 text-sm font-medium transition hover:bg-[#f5f3ef]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#25251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#44443b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-[0_4px_24px_rgba(37,37,31,0.025)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(37,37,31,0.06)] sm:p-6">
      <p className="text-sm font-medium text-[#777369]">{label}</p>
      <p className="mt-5 text-4xl font-medium tracking-tight text-[#25251f]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[#999488]">{description}</p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-[#e7e3db] bg-white p-6 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none text-[#999488] transition hover:text-black"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
