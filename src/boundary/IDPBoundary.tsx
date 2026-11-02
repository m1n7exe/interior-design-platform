"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface IDPProject {
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

interface MarketplaceResponse {
  success: boolean;
  projects: IDPProject[];
  error: string | null;
}

const DEFAULT_CATEGORIES = [
  "All",
  "Residential",
  "Commercial",
  "Office",
  "Restaurant & Café",
];

export default function IDPBoundary() {
  const [projects, setProjects] = useState<IDPProject[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProject, setSelectedProject] =
    useState<IDPProject | null>(null);

  // Supabase client for generating public image URLs.
  const supabase = useMemo(() => createClient(), []);

  // Convert a Storage path into a public image URL.
  const getCoverImageUrl = useCallback(
    (imagePath: string | null): string | null => {
      if (!imagePath) return null;

      // Allow existing complete URLs as well.
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
      }

      const { data } = supabase.storage
        .from("project-images")
        .getPublicUrl(imagePath);

      return data.publicUrl;
    },
    [supabase]
  );

  // Retrieve published projects through the API.
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/idp/marketplace", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result: MarketplaceResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Unable to retrieve projects.");
      }

      setProjects(result.projects ?? []);
    } catch (err) {
      console.error("Marketplace retrieval error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while retrieving projects."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Generate categories from database records.
  const categories = useMemo(() => {
    const availableCategories = Array.from(
      new Set(projects.map((project) => project.category).filter(Boolean))
    ).sort();

    return ["All", ...availableCategories];
  }, [projects]);

  // Search and category filtering.
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || project.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [projects, search, category]);

  const formatBudget = (budget: number | null) => {
    if (budget === null) return "Contact for pricing";

    return `S$${budget.toLocaleString("en-SG")}`;
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#252525]">

      {/* Navigation */}
      <nav className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/marketplace" className="text-xl font-bold tracking-tight">
            space<span className="text-[#9a8065]">.</span>
          </a>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="/marketplace" className="font-medium">
              Explore Projects
            </a>

            <a href="#designers" className="text-gray-500 transition hover:text-black">
              Designers
            </a>
          </div>

          <a
            href="/login"
            className="rounded-full bg-[#252525] px-5 py-2.5 text-sm text-white transition hover:bg-black"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 md:pb-16 md:pt-24">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#9a8065]">
          The Interior Design Marketplace
        </p>

        <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
          Find inspiration.
          <br />
          <span className="text-[#9a8065]">Design your space.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
          Explore interior design projects, discover talented designers,
          and find inspiration for your next space.
        </p>

        <div className="mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-5 py-4 text-sm outline-none transition focus:border-[#9a8065]"
          />

          <button
            type="button"
            onClick={() =>
              document.getElementById("projects")?.scrollIntoView({
                behavior: "smooth",
              })
            }
            className="rounded-lg bg-[#252525] px-7 py-4 text-sm font-medium text-white transition hover:bg-black"
          >
            Explore Projects
          </button>
        </div>
      </section>

      {/* Featured Banner */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl bg-[#e8e1d7] p-8 md:p-12">
          <div className="relative z-10 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#80684f]">
              Curated Inspiration
            </p>

            <h2 className="mt-4 text-3xl font-medium leading-tight md:text-4xl">
              Great spaces start with great ideas.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-gray-700">
              Browse residential, commercial, and hospitality projects
              to find a style that feels like you.
            </p>

            <button
              type="button"
              onClick={() =>
                document.getElementById("projects")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="mt-6 rounded-full border border-[#252525] px-6 py-3 text-sm transition hover:bg-[#252525] hover:text-white"
            >
              Discover Designs →
            </button>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-20 hidden h-80 w-80 rounded-full border border-[#b7a48e] md:block" />

          <div className="pointer-events-none absolute -right-2 -top-12 hidden h-64 w-64 rounded-full border border-[#b7a48e] md:block" />
        </div>
      </section>

      {/* Project Listings */}
      <section id="projects" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8065]">
              Explore the Collection
            </p>

            <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
              Interior design projects
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Discover spaces designed by independent professionals.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            {loading ? "Loading projects..." : `${filteredProjects.length} projects`}
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-3">
          {(projects.length > 0 ? categories : DEFAULT_CATEGORIES).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-5 py-2.5 text-sm transition ${
                  category === item
                    ? "border-[#252525] bg-[#252525] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-[4/3] rounded-xl bg-gray-200" />
                <div className="mt-4 h-5 w-2/3 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-1/3 rounded bg-gray-200" />
                <div className="mt-4 h-4 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-20 text-center">
            <h3 className="text-xl font-medium">
              Unable to load projects
            </h3>

            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={fetchProjects}
              className="mt-6 rounded-full bg-[#252525] px-6 py-3 text-sm text-white transition hover:bg-black"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="text-xl font-medium">
              {projects.length === 0
                ? "No projects available yet"
                : "No projects found"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {projects.length === 0
                ? "Check back soon for new interior design projects."
                : "Try another search or category."}
            </p>

            {(search || category !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-5 text-sm underline underline-offset-4"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Project Cards */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const coverImageUrl = getCoverImageUrl(project.coverImage);

              return (
                <article key={project.id} className="group">

                  {/* Project Image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200">
                    {coverImageUrl ? (
                      <img
                        src={coverImageUrl}
                        alt={project.title}
                        loading="lazy"
                        onError={(event) => {
                          console.error("Failed to load cover image:", coverImageUrl);
                          event.currentTarget.style.display = "none";
                        }}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                        No project image
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium">
                      {project.category}
                    </span>
                  </div>

                  {/* Project Information */}
                  <div className="flex items-start justify-between gap-3 pt-4">
                    <div>
                      <h3 className="text-lg font-medium tracking-tight">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Interior Design Project
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-400">
                        Est. budget
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatBudget(project.budget)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                    {project.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="mt-4 border-b border-[#9a8065] pb-1 text-sm font-medium text-[#80684f] transition hover:text-black"
                  >
                    View Project →
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Designer CTA */}
      <section id="designers" className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-14 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8065]">
              For Interior Designers
            </p>

            <h2 className="mt-3 text-2xl font-medium">
              Showcase your work to new customers.
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Build your portfolio and help customers discover your projects.
            </p>
          </div>

          <a
            href="/signup"
            className="w-fit rounded-full bg-[#252525] px-7 py-3.5 text-sm text-white transition hover:bg-black"
          >
            Join as a Designer →
          </a>
        </div>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-medium">
                Project Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="text-2xl text-gray-400 transition hover:text-black"
                aria-label="Close project details"
              >
                &times;
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-6">
              {getCoverImageUrl(selectedProject.coverImage) && (
                <img
                  src={getCoverImageUrl(selectedProject.coverImage)!}
                  alt={selectedProject.title}
                  className="mb-6 aspect-video w-full rounded-xl object-cover"
                />
              )}

              <span className="rounded-full bg-[#e8e1d7] px-3 py-1.5 text-xs font-medium text-[#80684f]">
                {selectedProject.category}
              </span>

              <h3 className="mt-4 text-2xl font-medium">
                {selectedProject.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                {selectedProject.description}
              </p>

              <div className="mt-6 border-y border-gray-100 py-5">
                <p className="text-xs text-gray-400">
                  Estimated project budget
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {formatBudget(selectedProject.budget)}
                </p>
              </div>

              {/* Gallery */}
              {selectedProject.images?.length > 0 && (
                <div className="mt-7">
                  <h4 className="mb-4 text-lg font-medium">
                    Project Gallery
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedProject.images.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={getCoverImageUrl(image) ?? ""}
                        alt={`${selectedProject.title} - Image ${index + 1}`}
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-black/10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 text-xs text-gray-400 sm:flex-row">
          <p>space. — Interior Design Marketplace</p>
          <p>Interior Design Projects</p>
        </div>
      </footer>
    </main>
  );
}