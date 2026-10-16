"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthController } from "@/controller/AuthController";

type Role = "CUSTOMER" | "INTERIOR_DESIGNER";

type Account = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<Role>("CUSTOMER");

  const router = useRouter();

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const getAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      const result = await response.json();

      if (response.ok && result.success) {
        setUsers(result.users);
      } else {
        showMessage(result.error ?? "Unable to retrieve accounts.", "error");
      }
    } catch {
      showMessage("Unable to connect to the server.", "error");
    }
  }, []);

  useEffect(() => {
    void getAccounts();
  }, [getAccounts]);

  const customerCount = users.filter(
    (user) => user.user_metadata?.role === "CUSTOMER"
  ).length;

  const designerCount = users.filter(
    (user) => user.user_metadata?.role === "INTERIOR_DESIGNER"
  ).length;

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      const userName = user.user_metadata?.name ?? "";
      const userEmail = user.email ?? "";
      const userRole = user.user_metadata?.role ?? "";

      return `${userName} ${userEmail} ${userRole}`
        .toLowerCase()
        .includes(term);
    });
  }, [users, search]);

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

  async function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage("Account created successfully.", "success");
        setName("");
        setEmail("");
        setPassword("");
        setRole("CUSTOMER");
        await getAccounts();
      } else {
        showMessage(result.error ?? "Unable to create account.", "error");
      }
    } catch {
      showMessage("A network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  }

  function startEditing(user: Account) {
    const userRole = user.user_metadata?.role;

    if (
      userRole !== "CUSTOMER" &&
      userRole !== "INTERIOR_DESIGNER"
    ) {
      showMessage("This account cannot be edited here.", "error");
      return;
    }

    setEditingUser(user);
    setEditName(user.user_metadata?.name ?? "");
    setEditEmail(user.email ?? "");
    setEditRole(userRole);
    setMessage("");
  }

  function cancelEditing() {
    setEditingUser(null);
    setEditName("");
    setEditEmail("");
    setEditRole("CUSTOMER");
  }

  async function updateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          role: editRole,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showMessage(result.error ?? "Unable to update account.", "error");
        return;
      }

      showMessage("Account updated successfully.", "success");
      cancelEditing();
      await getAccounts();
    } catch {
      showMessage("A network error occurred while updating the account.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account? This action cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage("Account deleted successfully.", "success");
        await getAccounts();
      } else {
        showMessage(result.error ?? "Unable to delete account.", "error");
      }
    } catch {
      showMessage("A network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#e5e1d8] bg-[#fcfbf9] px-4 py-3 text-sm text-[#25251f] outline-none transition placeholder:text-[#aaa69c] focus:border-[#777468] focus:ring-2 focus:ring-[#777468]/10 disabled:opacity-60";

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#25251f]">

      {/* Navigation */}
      <header className="border-b border-[#e5dcf2] bg-[#eee7f8]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div>
            <a href="/" className="text-2xl font-semibold tracking-tight text-[#302642]">
              Interior<span className="text-[#9b85bc]">.</span>
            </a>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#827394]">
              Administration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#ded3ed] bg-[#f9f6fd] px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#82977b]" />
              <span className="text-xs font-medium text-[#62556f]">
                Administrator
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="rounded-full border border-[#d3c5e4] bg-[#f9f6fd] px-4 py-2.5 text-sm font-medium text-[#493b5c] transition hover:bg-white disabled:opacity-50"
            >
              {loading ? "Logging out..." : "Log out"}
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
              Create accounts, manage users, and keep your interior design
              community organised.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#777369]">
            <span className="h-2 w-2 rounded-full bg-[#7c8b69]" />
            User management
          </div>
        </section>

        {/* Statistics */}
        <section
          aria-label="User statistics"
          className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <StatCard
            label="Total accounts"
            value={users.length}
            description="All registered users"
            symbol="◎"
          />
          <StatCard
            label="Customers"
            value={customerCount}
            description="People looking for designers"
            symbol="↗"
          />
          <StatCard
            label="Interior designers"
            value={designerCount}
            description="Design professionals"
            symbol="⌂"
          />
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
              {messageType === "success" ? "✓" : "!"}
            </span>
            <p>{message}</p>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setMessage("")}
              className="ml-auto text-lg leading-none opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="grid items-start gap-7 xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* Create account */}
          <section className="rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-[0_4px_24px_rgba(37,37,31,0.025)] sm:p-7">
            <div className="mb-7 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1efe9] text-xl">
                +
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Create an account
                </h2>
                <p className="mt-1 text-sm leading-5 text-[#898579]">
                  Add a new member to the platform.
                </p>
              </div>
            </div>

            <form onSubmit={createAccount} className="space-y-5">
              <div>
                <label
                  htmlFor="account-name"
                  className="mb-2 block text-sm font-medium text-[#4c4a42]"
                >
                  Full name
                </label>
                <input
                  id="account-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={100}
                  disabled={loading}
                  className={inputClass}
                  placeholder="e.g. Alex Tan"
                />
              </div>

              <div>
                <label
                  htmlFor="account-email"
                  className="mb-2 block text-sm font-medium text-[#4c4a42]"
                >
                  Email address
                </label>
                <input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                  className={inputClass}
                  placeholder="alex@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="account-password"
                  className="mb-2 block text-sm font-medium text-[#4c4a42]"
                >
                  Password
                </label>
                <input
                  id="account-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
                <p className="mt-2 text-xs leading-5 text-[#999488]">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="account-role"
                  className="mb-2 block text-sm font-medium text-[#4c4a42]"
                >
                  Account type
                </label>
                <select
                  id="account-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                  disabled={loading}
                  className={inputClass}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="INTERIOR_DESIGNER">Interior designer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25251f] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#44443b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Create account"}
                {!loading && <span aria-hidden="true">↗</span>}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-[#999488]">
              The account will be assigned the selected role.
            </p>
          </section>

          {/* User directory */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e7e3db] bg-white shadow-[0_4px_24px_rgba(37,37,31,0.025)]">
            <div className="flex flex-col gap-4 border-b border-[#eeeae3] p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  User directory
                </h2>
                <p className="mt-1 text-sm text-[#898579]">
                  View and manage platform accounts.
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#928d82]"
                >
                  ⌕
                </span>
                <input
                  type="search"
                  aria-label="Search accounts"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email or role..."
                  className="w-full rounded-xl border border-[#e5e1d8] bg-[#fcfbf9] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aaa69c] focus:border-[#777468] focus:ring-2 focus:ring-[#777468]/10"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeae3] bg-[#fcfbf9] px-5 py-3.5 sm:px-7">
              <p className="text-xs text-[#817c71]">
                Showing{" "}
                <span className="font-semibold text-[#37362f]">
                  {filteredUsers.length}
                </span>{" "}
                of {users.length} accounts
              </p>

              <button
                type="button"
                onClick={() => void getAccounts()}
                className="text-xs font-semibold text-[#5b594f] transition hover:text-black"
              >
                ↻ Refresh list
              </button>
            </div>


        {editingUser && (
          <div className="border-b border-[#e5dcf2] bg-[#f9f6fd] p-5 sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#302642]">
                  Edit user account
                </h3>
                <p className="mt-1 text-sm text-[#827394]">
                  Update the account details below.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelEditing}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-sm text-[#6f648b] hover:bg-[#eee7f8] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={updateAccount} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-name" className="mb-2 block text-sm font-medium text-[#4c4a42]">
                  Full name
                </label>
                <input
                  id="edit-name"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  required
                  maxLength={100}
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="mb-2 block text-sm font-medium text-[#4c4a42]">
                  Email address
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="edit-role" className="mb-2 block text-sm font-medium text-[#4c4a42]">
                  Account type
                </label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(event) => setEditRole(event.target.value as Role)}
                  disabled={loading}
                  className={inputClass}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="INTERIOR_DESIGNER">Interior designer</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#302642] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#493b5c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        )}


            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-[#eeeae3] bg-white">
                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999488] sm:px-7">
                      User
                    </th>
                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999488]">
                      Email address
                    </th>
                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999488]">
                      Role
                    </th>
                    <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999488] sm:px-7">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0ede7]">
                  {filteredUsers.map((user) => {
                    const userName = user.user_metadata?.name ?? "Unnamed user";
                    const userRole = user.user_metadata?.role ?? "Unknown";

                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-[#fcfbf8]"
                      >
                        <td className="px-5 py-4 sm:px-7">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efede6] text-sm font-semibold text-[#5d5a50]">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-[#37362f]">
                              {userName}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#777369]">
                          {user.email ?? "No email"}
                        </td>

                        <td className="px-5 py-4">
                          <RoleBadge role={userRole} />
                        </td>

                        
                        <td className="px-5 py-4 text-right sm:px-7">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(user)}
                              disabled={loading}
                              className="rounded-lg border border-[#ded3ed] bg-[#f9f6fd] px-3 py-2 text-xs font-medium text-[#68538d] transition hover:bg-[#eee7f8] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => void deleteAccount(user.id)}
                              disabled={loading}
                              className="rounded-lg border border-[#ead8d4] px-3 py-2 text-xs font-medium text-[#a24f43] transition hover:bg-[#fbefed] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1efe9] text-xl text-[#817c71]">
                          ⌕
                        </div>
                        <p className="mt-4 text-sm font-medium text-[#4c4a42]">
                          {users.length === 0
                            ? "No accounts found"
                            : "No matching accounts"}
                        </p>
                        <p className="mt-1 text-xs text-[#999488]">
                          {users.length === 0
                            ? "Accounts will appear here once available."
                            : "Try another name, email address or role."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#eeeae3] px-5 py-4 sm:px-7">
              <p className="text-xs leading-5 text-[#999488]">
                Account changes are applied through the platform API.
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-[#e4e0d7] pt-5 text-xs text-[#999488] sm:flex-row">
          <p>Interior. — Administration dashboard</p>
          <p>Account management</p>
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
  symbol,
}: {
  label: string;
  value: number;
  description: string;
  symbol: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-[0_4px_24px_rgba(37,37,31,0.025)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(37,37,31,0.06)] sm:p-6">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[#777369]">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1efe9] text-xl text-[#625f56]">
          {symbol}
        </span>
      </div>
      <p className="mt-5 text-4xl font-medium tracking-tight text-[#25251f]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[#999488]">{description}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isDesigner = role === "INTERIOR_DESIGNER";
  const isCustomer = role === "CUSTOMER";

  const label = isDesigner
    ? "Interior designer"
    : isCustomer
      ? "Customer"
      : role;

  const styles = isDesigner
    ? "bg-[#f0edf7] text-[#68538d]"
    : isCustomer
      ? "bg-[#edf3e9] text-[#527047]"
      : "bg-[#f1efe9] text-[#777369]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${styles}`}
    >
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}