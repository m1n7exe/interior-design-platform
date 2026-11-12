"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

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

  archivedAt: string | null;

}

interface DesignerProfile {
  user_id: string;
  company_name: string | null;
  bio: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  years_of_experience: number | null;
  specialisations: string[] | null;
}

interface MarketplaceResponse {

  success: boolean;

  projects: IDPProject[];

  error: string | null;

  categories?: string[];

}

interface FavouritesResponse {

  success: boolean;

  favourites?: (string | { id: string })[];

  error?: string | null;

}

// Safely parse API responses

async function parseApiResponse<T>(

  response: Response

): Promise<T> {

const text = await response.text();

  try {

return JSON.parse(text) as T;

  } catch {

    throw new Error(

      `Invalid API response. HTTP ${response.status}: ${text.slice(0, 150)}`

    );

  }

}

export default function IDPBoundary() {

const router = useRouter();

// ==================================================

// MARKETPLACE STATE

// ==================================================

const [projects, setProjects] = useState<IDPProject[]>([]);

const [search, setSearch] = useState("");

const [category, setCategory] = useState("All");

const [categoryNames, setCategoryNames] = useState<string[]>([]);

// ==================================================

// REQUEST STATE

// ==================================================

const [loading, setLoading] = useState(true);

const [error, setError] = useState<string | null>(null);

// ==================================================

// FAVOURITES STATE

// ==================================================

const [favouriteProjectIds, setFavouriteProjectIds] =

    useState<Set<string>>(new Set());

const [favouritesLoading, setFavouritesLoading] =

    useState(true);

const [favouriteActionLoading, setFavouriteActionLoading] =

    useState<string | null>(null);

const [favouriteError, setFavouriteError] =

    useState<string | null>(null);

// ==================================================

// PROJECT DETAIL STATE

// ==================================================

const [selectedProject, setSelectedProject] =

    useState<IDPProject | null>(null);

// ==================================================

// SUPABASE CLIENT

// ==================================================

const supabase = useMemo(() => createClient(), []);

  const [designerProfile, setDesignerProfile] = useState<DesignerProfile | null>(null);
  const [designerLoading, setDesignerLoading] = useState(false);
  const [designerError, setDesignerError] = useState<string | null>(null);

  // Change this if your designer profile table has a different name.
  const designerTable = "interior_designers";

  useEffect(() => {
    if (!selectedProject?.designerId) {
      setDesignerProfile(null);
      setDesignerError(null);
      setDesignerLoading(false);
      return;
    }

    let cancelled = false;
    setDesignerProfile(null);
    setDesignerError(null);
    setDesignerLoading(true);

    const loadDesigner = async () => {
      const { data, error } = await supabase
        .from(designerTable)
        .select("user_id, company_name, bio, logo_url, website, phone, email, address, years_of_experience, specialisations")
        .eq("user_id", selectedProject.designerId)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("Designer profile retrieval error:", error);
        setDesignerError("Unable to load designer details.");
      } else if (!data) {
        setDesignerError("Designer profile is unavailable.");
      } else {
        setDesignerProfile(data as DesignerProfile);
      }
      setDesignerLoading(false);
    };

    void loadDesigner();
    return () => { cancelled = true; };
  }, [selectedProject?.designerId, supabase]);

// ==================================================

// IMAGE HANDLING

// ==================================================

const getCoverImageUrl = useCallback(

    (imagePath: string | null): string | null => {

      if (!imagePath) return null;

      if (

        imagePath.startsWith("http://") ||

        imagePath.startsWith("https://")

      ) {

return imagePath;

      }

const { data } = supabase.storage

        .from("project-images")

        .getPublicUrl(imagePath);

return data.publicUrl;

    },

    [supabase]

  );

// ==================================================

// PROJECT RETRIEVAL

// ==================================================

const fetchProjects = useCallback(async () => {

    try {

      setLoading(true);

      setError(null);

const response = await fetch("/api/idp/marketplace", {

        method: "GET",

        cache: "no-store",

      });

const result =

await parseApiResponse<MarketplaceResponse>(response);

      if (!response.ok || !result.success) {

        throw new Error(

          result.error || `Request failed: ${response.status}`

        );

      }

      setProjects(result.projects ?? []);

      setCategoryNames(result.categories ?? []);

    } catch (err) {

      console.error("Marketplace retrieval error:", err);

      setError(

        err instanceof Error

          ? err.message

          : "Unable to retrieve projects."

      );

    } finally {

      setLoading(false);

    }

  }, []);

// ==================================================

// FETCH CUSTOMER FAVOURITES

// ==================================================

const fetchFavourites = useCallback(async () => {

    try {

      setFavouritesLoading(true);

const response = await fetch("/api/idp/favourites", {

        method: "GET",

        cache: "no-store",

      });

// Public visitors can still browse the marketplace.

      if (response.status === 401 || response.status === 403) {

        setFavouriteProjectIds(new Set());

return;

      }

const result =

await parseApiResponse<FavouritesResponse>(response);

// Signed-in users who are not customers (e.g. designers) have no favourites.

      if (result.error === "Customer profile not found") {

        setFavouriteProjectIds(new Set());

return;

      }

      if (!response.ok || !result.success) {

        throw new Error(

          result.error || "Unable to retrieve favourites."

        );

      }

      setFavouriteProjectIds(

        new Set(

          (result.favourites ?? []).map((favourite) =>

            typeof favourite === "string" ? favourite : favourite.id

          )

        )

      );

    } catch (err) {

      console.error("Favourites retrieval error:", err);

      setFavouriteError(

        err instanceof Error

          ? err.message

          : "Unable to retrieve favourites."

      );

    } finally {

      setFavouritesLoading(false);

    }

  }, []);

// ==================================================

// INITIAL DATA LOADING

// ==================================================

  useEffect(() => {

    fetchProjects();

    fetchFavourites();

  }, [fetchProjects, fetchFavourites]);

// ==================================================// OPEN A PROJECT FROM A SHARED MARKETPLACE LINK

  useEffect(() => {

    if (loading || projects.length === 0) return;

const params = new URLSearchParams(window.location.search);

const projectId = params.get("project");

    if (!projectId) return;

const project = projects.find((item) => item.id === projectId);

    if (project) {

      setSelectedProject(project);

    }

  }, [loading, projects]);

// TOGGLE FAVOURITE// ==================================================

const toggleFavourite = async (projectId: string) => {

    if (favouriteActionLoading) return;

    setFavouriteError(null);

    setFavouriteActionLoading(projectId);

const isFavourited =

      favouriteProjectIds.has(projectId);

    try {

const response = await fetch("/api/idp/favourites", {

        method: isFavourited ? "DELETE" : "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          projectId,

        }),

      });

      if (response.status === 401) {

        router.push("/login");

return;

      }

const result =

await parseApiResponse<FavouritesResponse>(response);

      if (!response.ok || !result.success) {

        throw new Error(

          result.error ||

            (isFavourited

              ? "Unable to remove favourite."

              : "Unable to save favourite.")

        );

      }

// Update local state only after successful API response.

      setFavouriteProjectIds((previous) => {

const updated = new Set(previous);

        if (isFavourited) {

          updated.delete(projectId);

        } else {

          updated.add(projectId);

        }

return updated;

      });

    } catch (err) {

      console.error("Favourite action error:", err);

      setFavouriteError(

        err instanceof Error

          ? err.message

          : "Something went wrong."

      );

    } finally {

      setFavouriteActionLoading(null);

    }

  };

// ==================================================

// RECORD PROJECT VIEW

// ==================================================

const handleViewProject = async (project: IDPProject) => {

// Open the modal immediately.

    setSelectedProject(project);

    try {

const response = await fetch("/api/idp/project-views", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          projectId: project.id,

        }),

      });

// Unauthenticated visitors can still browse the marketplace.

      if (response.status === 401) {

return;

      }

      if (!response.ok) {

const result = await parseApiResponse<{

          success: boolean;

          error?: string;

        }>(response);

        console.error(

          "Unable to record project view:",

          result.error

        );

      }

    } catch (error) {

// View tracking should not prevent customers from viewing projects.

      console.error("Project view tracking error:", error);

    }

  };

// ==================================================

// CATEGORY GENERATION

// ==================================================

const categories = useMemo(() => {

const names = new Set<string>(categoryNames);

    projects.forEach((project) => {

      if (project.category) names.add(project.category);

    });

return ["All", ...Array.from(names).sort()];

  }, [categoryNames, projects]);

// ==================================================

// SEARCH AND FILTERING

// ==================================================

const filteredProjects = useMemo(() => {

const query = search.trim().toLowerCase();

return projects.filter((project) => {

const searchableContent = [

        project.title,

        project.description,

        project.category,

        project.status,

      ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();

const matchesSearch =

        searchableContent.includes(query);

const matchesCategory =

        category === "All" ||

        project.category === category;

return matchesSearch && matchesCategory;

    });

  }, [projects, search, category]);

// ==================================================

// FILTER RESET

// ==================================================

const clearFilters = () => {

    setSearch("");

    setCategory("All");

  };

// ==================================================

// FORMATTING

// ==================================================

const formatBudget = (budget: number | null) => {

    if (budget === null) {

return "Contact for pricing";

    }

return `S$${budget.toLocaleString("en-SG")}`;

  };

// ==================================================

// SCROLL HANDLING

// ==================================================

const scrollToProjects = () => {

    document.getElementById("projects")?.scrollIntoView({

      behavior: "smooth",

    });

  };

// ==================================================

// RENDER

// ==================================================

return (

    <main className="min-h-screen bg-[#faf9f6] text-[#252525]">

      {/* NAVIGATION */}

      <nav className="border-b border-black/10 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <a

            href="/marketplace"

            className="text-xl font-bold tracking-tight"

          >

            space<span className="text-[#9a8065]">.</span>

          </a>

          <div className="hidden items-center gap-8 text-sm md:flex">

            <a

              href="/marketplace"

              className="font-medium"

            >

              Explore Projects

            </a>

            <a

              href="#designers"

              className="text-gray-500 transition hover:text-black"

            >

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

      {/* HERO SECTION */}

      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 md:pb-16 md:pt-24">

        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#9a8065]">

          The Interior Design Marketplace

        </p>

        <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">

          Find inspiration.

          <br />

          <span className="text-[#9a8065]">

            Design your space.

          </span>

        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 md:text-lg">

          Explore interior design projects, discover talented

          designers, and find inspiration for your next space.

        </p>

        {/* SEARCH BAR */}

        <div className="mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">

            <svg

              xmlns="http://www.w3.org/2000/svg"

              className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"

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

              onChange={(event) =>

                setSearch(event.target.value)

              }

              onKeyDown={(event) => {

                if (event.key === "Enter") {

                  scrollToProjects();

                }

              }}

              placeholder="Search projects, styles, or categories..."

              aria-label="Search interior design projects"

              className="w-full rounded-lg border border-gray-200 bg-white py-4 pl-14 pr-12 text-sm outline-none transition focus:border-[#9a8065] focus:ring-2 focus:ring-[#9a8065]/10"

            />

            {search && (

              <button

                type="button"

                onClick={() => setSearch("")}

                aria-label="Clear search"

                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 transition hover:text-black"

              >

                ×

              </button>

            )}

          </div>

          <button

            type="button"

            onClick={scrollToProjects}

            className="rounded-lg bg-[#252525] px-7 py-4 text-sm font-medium text-white transition hover:bg-black"

          >

            Explore Projects

          </button>

        </div>

      </section>

      {/* FEATURED BANNER */}

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

              Browse residential, commercial, and hospitality

              projects to find a style that feels like you.

            </p>

            <button

              type="button"

              onClick={scrollToProjects}

              className="mt-6 rounded-full border border-[#252525] px-6 py-3 text-sm transition hover:bg-[#252525] hover:text-white"

            >

              Discover Designs →

            </button>

          </div>

          <div className="pointer-events-none absolute -right-10 -top-20 hidden h-80 w-80 rounded-full border border-[#b7a48e] md:block" />

          <div className="pointer-events-none absolute -right-2 -top-12 hidden h-64 w-64 rounded-full border border-[#b7a48e] md:block" />

        </div>

      </section>

      {/* PROJECT LISTINGS */}

      <section

        id="projects"

        className="mx-auto max-w-7xl px-6 py-16 md:py-20"

      >

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

          <p className="text-sm text-gray-500" aria-live="polite">

            {loading

              ? "Loading projects..."

              : `${filteredProjects.length} ${

                  filteredProjects.length === 1

                    ? "project"

                    : "projects"

                } found`}

          </p>

        </div>

        {/* CATEGORY FILTERS */}

        <div className="mt-8 flex gap-2 overflow-x-auto pb-3">

          {categories.map((item) => (

            <button

              key={item}

              type="button"

              onClick={() => setCategory(item)}

              aria-pressed={category === item}

              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm transition ${

                category === item

                  ? "border-[#252525] bg-[#252525] text-white"

                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"

              }`}

            >

              {item}

            </button>

          ))}

        </div>

        {/* FAVOURITE ERROR */}

        {favouriteError && (

          <div

            role="alert"

            className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"

          >

            <p>{favouriteError}</p>

            <button

              type="button"

              onClick={() => setFavouriteError(null)}

              className="shrink-0 text-lg"

              aria-label="Dismiss error"

            >

              ×

            </button>

          </div>

        )}

        {/* LOADING STATE */}

        {loading && (

          <div className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (

              <div

                key={item}

                className="animate-pulse"

              >

                <div className="aspect-[4/3] rounded-xl bg-gray-200" />

                <div className="mt-4 h-5 w-2/3 rounded bg-gray-200" />

                <div className="mt-3 h-4 w-1/3 rounded bg-gray-200" />

                <div className="mt-4 h-4 w-full rounded bg-gray-200" />

              </div>

            ))}

          </div>

        )}

        {/* ERROR STATE */}

        {!loading && error && (

          <div className="py-20 text-center">

            <h3 className="text-xl font-medium">

              Unable to load projects

            </h3>

            <p className="mt-2 text-sm text-gray-500">

              {error}

            </p>

            <button

              type="button"

              onClick={fetchProjects}

              className="mt-6 rounded-full bg-[#252525] px-6 py-3 text-sm text-white transition hover:bg-black"

            >

              Try Again

            </button>

          </div>

        )}

        {/* EMPTY STATE */}

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

                onClick={clearFilters}

                className="mt-5 text-sm underline underline-offset-4 transition hover:text-[#9a8065]"

              >

                Clear filters

              </button>

            )}

          </div>

        )}

        {/* PROJECT CARDS */}

        {!loading && !error && filteredProjects.length > 0 && (

          <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">

            {filteredProjects.map((project) => {

const coverImageUrl = getCoverImageUrl(

                project.coverImage

              );

const isFavourited =

                favouriteProjectIds.has(project.id);

const isFavouriteActionLoading =

                favouriteActionLoading === project.id;

return (

                <article

                  key={project.id}

                  className="group"

                >

                  {/* PROJECT IMAGE */}

                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200">

                    {coverImageUrl ? (

                      <img

                        src={coverImageUrl}

                        alt={project.title}

                        loading="lazy"

                        onError={(event) => {

                          console.error(

                            "Failed to load cover image:",

                            coverImageUrl

                          );

                          event.currentTarget.style.display = "none";

                        }}

                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"

                      />

                    ) : (

                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">

                        No project image

                      </div>

                    )}

                    {/* CATEGORY */}

                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium">

                      {project.category}

                    </span>

                    {/* FAVOURITE BUTTON */}

                    <button

                      type="button"

                      onClick={() => toggleFavourite(project.id)}

                      disabled={

                        favouritesLoading ||

                        favouriteActionLoading !== null

                      }

                      aria-label={

                        isFavourited

                          ? "Remove from favourites"

                          : "Add to favourites"

                      }

                      aria-pressed={isFavourited}

                      title={

                        isFavourited

                          ? "Remove from favourites"

                          : "Add to favourites"

                      }

                      className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${

                        isFavourited

                          ? "text-red-500"

                          : "text-gray-600"

                      }`}

                    >

                      {isFavouriteActionLoading ? (

                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#9a8065]" />

                      ) : (

                        <svg

                          xmlns="http://www.w3.org/2000/svg"

                          viewBox="0 0 24 24"

                          className="h-5 w-5"

                          fill={isFavourited ? "currentColor" : "none"}

                          stroke="currentColor"

                          strokeWidth="1.8"

                          aria-hidden="true"

                        >

                          <path

                            strokeLinecap="round"

                            strokeLinejoin="round"

                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"

                          />

                        </svg>

                      )}

                    </button>

                  </div>

                  {/* PROJECT INFORMATION */}

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

                  {/* DESCRIPTION */}

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">

                    {project.description}

                  </p>

                  {/* VIEW PROJECT */}

                  <button

                    type="button"

                    onClick={() => handleViewProject(project)}

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

      {/* DESIGNER CTA */}

      <section

        id="designers"

        className="border-t border-black/10 bg-white"

      >

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

      {/* PROJECT DETAIL MODAL */}

      {selectedProject && (

        <div

          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"

          onClick={() => setSelectedProject(null)}

        >

          <div

            role="dialog"

            aria-modal="true"

            aria-labelledby="project-modal-title"

            className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white"

            onClick={(event) => event.stopPropagation()}

          >

            {/* MODAL HEADER */}

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

                ×

              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="max-h-[80vh] overflow-y-auto p-6">

              {getCoverImageUrl(selectedProject.coverImage) && (

                <img

                  src={

                    getCoverImageUrl(selectedProject.coverImage)!

                  }

                  alt={selectedProject.title}

                  className="mb-6 aspect-video w-full rounded-xl object-cover"

                />

              )}

              <span className="rounded-full bg-[#e8e1d7] px-3 py-1.5 text-xs font-medium text-[#80684f]">

                {selectedProject.category}

              </span>

              <h3

                id="project-modal-title"

                className="mt-4 text-2xl font-medium"

              >

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

              {/* INTERIOR DESIGNER PROFILE */}
              <section className="mt-8 rounded-2xl border border-gray-200 bg-[#faf9f6] p-6">
                <h4 className="text-lg font-semibold">About the Interior Designer</h4>
                {designerLoading ? (
                  <p className="mt-4 text-sm text-gray-500">Loading designer details...</p>
                ) : designerError ? (
                  <p className="mt-4 text-sm text-gray-500">{designerError}</p>
                ) : designerProfile ? (
                  <div className="mt-5 space-y-5">
                    <div className="flex items-center gap-4">
                      {designerProfile.logo_url ? (
                        <img src={designerProfile.logo_url} alt={`${designerProfile.company_name || "Designer"} logo`}
                          className="h-16 w-16 rounded-xl border border-gray-200 bg-white object-contain" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#e8e1d7] text-2xl font-semibold text-[#80684f]">
                          {(designerProfile.company_name || "ID").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h5 className="text-xl font-semibold">{designerProfile.company_name || "Interior Designer"}</h5>
                        {designerProfile.years_of_experience != null && (
                          <p className="mt-1 text-sm text-gray-600">{designerProfile.years_of_experience} years of experience</p>
                        )}
                      </div>
                    </div>
                    {designerProfile.bio && <p className="text-sm leading-7 text-gray-700">{designerProfile.bio}</p>}
                    {designerProfile.specialisations?.length ? (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Specialisations</p>
                        <div className="flex flex-wrap gap-2">
                          {designerProfile.specialisations.map((item) => (
                            <span key={item} className="rounded-full bg-[#e8e1d7] px-3 py-1 text-xs text-[#80684f]">{item}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      {designerProfile.address && <p><span className="font-semibold">Address:</span> {designerProfile.address}</p>}
                      {designerProfile.phone && <p><span className="font-semibold">Phone:</span> <a className="underline" href={`tel:${designerProfile.phone}`}>{designerProfile.phone}</a></p>}
                      {designerProfile.email && <p><span className="font-semibold">Email:</span> <a className="break-all underline" href={`mailto:${designerProfile.email}`}>{designerProfile.email}</a></p>}
                      {designerProfile.website && /^https?:\/\//i.test(designerProfile.website) && (
                        <p><span className="font-semibold">Website:</span> <a className="break-all underline" href={designerProfile.website} target="_blank" rel="noopener noreferrer">Visit website</a></p>
                      )}
                    </div>
                  </div>
                ) : null}
              </section>

              {/* PROJECT GALLERY */}

              {selectedProject.images?.length > 0 && (

                <div className="mt-7">

                  <h4 className="mb-4 text-lg font-medium">

                    Project Gallery

                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">

                    {selectedProject.images.map(

                      (image, index) => {

const imageUrl = getCoverImageUrl(image);

                        if (!imageUrl) return null;

return (

                          <img

                            key={`${image}-${index}`}

                            src={imageUrl}

                            alt={`${selectedProject.title} - Image ${index + 1}`}

                            loading="lazy"

                            className="aspect-[4/3] w-full rounded-xl object-cover"

                          />

                        );

                      }

                    )}

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

      {/* FOOTER */}

      <footer className="border-t border-black/10 px-6 py-6">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 text-xs text-gray-400 sm:flex-row">

          <p>space. — Interior Design Marketplace</p>

          <p>Interior Design Projects</p>

        </div>

      </footer>

    </main>

  );

}
