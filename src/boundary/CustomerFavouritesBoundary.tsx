"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface FavouriteProject {
  id: string;
  designerId: string;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  status: string;
  coverImage: string | null;
  images: string[];
  createdAt: string;
}

export default function CustomerFavouritesBoundary() {
  const [projects, setProjects] = useState<FavouriteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const requestId = useRef(0);

  // Supabase client
  const supabase = useMemo(() => createClient(), []);

  // IMAGE HANDLING
  const getCoverImageUrl = useCallback(
    (imagePath: string | null): string | null => {
      if (!imagePath) return null;

      // Already a complete URL
      if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
      ) {
        return imagePath;
      }

      // Convert Supabase Storage path into public URL
      const { data } = supabase.storage
        .from("project-images")
        .getPublicUrl(imagePath);

      return data.publicUrl;
    },
    [supabase]
  );

  // Retrieve saved projects (optionally searching through the API)
  const loadFavourites = useCallback(async (term: string) => {
    const currentRequest = ++requestId.current;

    try {
      setError(null);

      const trimmed = term.trim();

      const response = await fetch(
        trimmed
          ? `/api/idp/favourites?q=${encodeURIComponent(trimmed)}`
          : "/api/idp/favourites",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

      // Ignore out-of-date responses while the user is still typing
      if (currentRequest !== requestId.current) return;

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to retrieve saved projects."
        );
      }

      setProjects(
        Array.isArray(result.favourites)
          ? result.favourites
          : []
      );
    } catch (err) {
      if (currentRequest !== requestId.current) return;

      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve your saved projects."
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  // Search as the user types (short delay avoids a request per keystroke)
  useEffect(() => {
    const timer = setTimeout(
      () => void loadFavourites(search),
      search ? 300 : 0
    );

    return () => clearTimeout(timer);
  }, [search, loadFavourites]);

  // Remove saved project
  async function handleRemove(projectId: string) {
    try {
      setRemoving(projectId);
      setError(null);

      const response = await fetch("/api/idp/favourites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to remove project.");
      }

      setProjects((current) =>
        current.filter((project) => project.id !== projectId)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove project."
      );
    } finally {
      setRemoving(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
              Customer Dashboard
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Saved Inspiration
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Your favourite interior design projects.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400"
          >
            Explore projects
          </Link>
        </header>

        {/* Collection */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">
              Your collection
            </h2>

            {!loading && (
              <span className="text-sm text-gray-400">
                {projects.length} {search.trim() ? "found" : "saved"}
              </span>
            )}
          </div>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search saved projects..."
                aria-label="Search saved projects"
                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-10 text-sm outline-none transition focus:border-[#9a8065] focus:ring-2 focus:ring-[#9a8065]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 transition hover:text-black"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
          {/* Loading */}
          {loading ? (
            <div className="py-24 text-center text-sm text-gray-400">
              Loading your saved projects...
            </div>

          /* Error */
          ) : error && projects.length === 0 ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                onClick={() => loadFavourites(search)}
                className="mt-4 text-sm font-medium text-gray-900 underline"
              >
                Try again
              </button>
            </div>

          /* No search results */
          ) : projects.length === 0 && search.trim() ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center">
              <h3 className="text-base font-semibold text-gray-900">
                No matching saved projects
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try another title, description or category.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 text-sm font-medium text-gray-900 underline"
              >
                Clear search
              </button>
            </div>


          /* Empty */
          ) : projects.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-6 w-6 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                  />
                </svg>
              </div>

              <h3 className="text-base font-semibold text-gray-900">
                No saved projects yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Save projects from the marketplace to find them here later.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                Browse marketplace
              </Link>
            </div>

          /* Projects */
          ) : (
            <>
              {error && (
                <p className="mb-4 text-sm text-red-600">{error}</p>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const imagePath =
                    project.coverImage ||
                    project.images?.[0] ||
                    null;

                  const imageUrl = getCoverImageUrl(imagePath);

                  return (
                    <article
                      key={project.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                    >
                      {/* Project Image */}
                      <div className="relative aspect-[4/3] bg-gray-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={project.title}
                            loading="lazy"
                            onError={() => {
                              console.error(
                                "Failed to load project image:",
                                imageUrl
                              );
                            }}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No image available
                          </div>
                        )}

                        {/* Remove Favourite */}
                        <button
                          onClick={() => handleRemove(project.id)}
                          disabled={removing === project.id}
                          aria-label="Remove from saved projects"
                          className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5 text-red-500"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A5.99 5.99 0 0116.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>

                      {/* Project Details */}
                      <div className="p-5">
                        {project.category && (
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                            {project.category}
                          </p>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.title || "Untitled project"}
                        </h3>

                        {project.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}