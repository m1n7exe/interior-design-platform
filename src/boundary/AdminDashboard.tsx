"use client";

import { useEffect, useState } from "react";

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

  const [role, setRole] = useState<
    "CUSTOMER" | "INTERIOR_DESIGNER"
  >("CUSTOMER");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieve user accounts
  async function getAccounts() {
    const response = await fetch("/api/admin/users");
    const result = await response.json();

    if (response.ok && result.success) {
      setUsers(result.users);
    } else {
      setMessage(result.error ?? "Unable to retrieve accounts.");
    }
  }

  useEffect(() => {
    void getAccounts();
  }, []);

  // Create a new account
  async function createAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("Account created successfully.");

        setName("");
        setEmail("");
        setPassword("");

        await getAccounts();
      } else {
        setMessage(result.error ?? "Unable to create account.");
      }
    } catch {
      setMessage("A network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // Delete an existing account
  async function deleteAccount(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account?"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/users/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("Account deleted successfully.");
        await getAccounts();
      } else {
        setMessage(result.error ?? "Unable to delete account.");
      }
    } catch {
      setMessage("A network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">
            InteriorDesignMatch
          </h1>

          <p className="mt-2 text-gray-500">
            Administrator Dashboard
          </p>
        </header>

        {/* Create Account */}
        <section className="mb-10 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">
            Create User Account
          </h2>

          <form onSubmit={createAccount} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Account Type
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value as
                      | "CUSTOMER"
                      | "INTERIOR_DESIGNER"
                  )
                }
                className="w-full rounded-lg border border-gray-300 p-3"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="INTERIOR_DESIGNER">
                  Interior Designer
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Create Account"}
            </button>
          </form>
        </section>

        {/* Status Message */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-lg border bg-white p-4"
          >
            {message}
          </div>
        )}

        {/* Account List */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">
            Manage User Accounts
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4">
                      {user.user_metadata?.name ?? "N/A"}
                    </td>

                    <td className="p-4">
                      {user.email ?? "N/A"}
                    </td>

                    <td className="p-4">
                      {user.user_metadata?.role ?? "N/A"}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => deleteAccount(user.id)}
                        disabled={loading}
                        className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-gray-500"
                    >
                      No accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}