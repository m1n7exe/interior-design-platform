"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  InteriorDesignerCompanyCreationController,
  InteriorDesignerCompanyRetrievalController,
  InteriorDesignerCompanyUpdateController,
  InteriorDesignerCompanyDeletionController,
} from "@/controller/InteriorDesignerCompanyController";

// ==================================================
// INTERFACES AND DEFAULT VALUES
// ==================================================

interface CompanyInformation {
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

interface IDPProject {
  id: string;
  designerId: string;
  title: string;
  description: string;
  categoryId: string;
  category: string;
  budget: number | null;
  status: string;
  coverImage: string | null;
  images: string[];
  createdAt: string;
}

interface IDPCategory {
  id: string;
  name: string;
}

interface IDPFormData {
  title: string;
  description: string;
  categoryId: string;
  budget: string;
  coverImage: string;
  status: string;
}

const emptyCompany: CompanyInformation = {
  company_name: "",
  bio: "",
  logo_url: "",
  website: "",
  phone: "",
  email: "",
  address: "",
  years_of_experience: null,
  specialisations: [],
};

const emptyProjectForm: IDPFormData = {
  title: "",
  description: "",
  categoryId: "",
  budget: "",
  coverImage: "",
  status: "PUBLISHED",
};

// ==================================================
// INTERIOR DESIGNER DASHBOARD
// ==================================================

export default function InteriorDesignerDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // ==================================================
  // COMPANY STATE
  // ==================================================

  const [userId, setUserId] = useState("");
  const [designerName, setDesignerName] = useState("Designer");

  const [company, setCompany] = useState<CompanyInformation | null>(null);
  const [formData, setFormData] =
    useState<CompanyInformation>(emptyCompany);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const [companyError, setCompanyError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ==================================================
  // PROJECT STATE
  // ==================================================

  const [projects, setProjects] = useState<IDPProject[]>([]);
  const [categories, setCategories] = useState<IDPCategory[]>([]);

  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectSaving, setProjectSaving] = useState(false);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] =
    useState<IDPProject | null>(null);

  const [projectForm, setProjectForm] =
    useState<IDPFormData>(emptyProjectForm);

  const [projectError, setProjectError] = useState("");
  const [projectSuccess, setProjectSuccess] = useState("");

  // ==================================================
  // LOAD DESIGNER PROJECTS
  // ==================================================

  async function loadProjects(isActive?: () => boolean) {
    setProjectsLoading(true);
    setProjectError("");

    try {
      const response = await fetch("/api/idp/designer-projects", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to retrieve your projects."
        );
      }

      if (isActive && !isActive()) return;

      setProjects(result.projects || []);
      setCategories(result.categories || []);
    } catch (error) {
      console.error("Unable to load designer projects:", error);

      if (isActive && !isActive()) return;

      setProjectError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve your projects."
      );
    } finally {
      if (!isActive || isActive()) {
        setProjectsLoading(false);
      }
    }
  }

  // ==================================================
  // AUTHENTICATION AND LOAD DASHBOARD INFORMATION
  // ==================================================

  useEffect(() => {
    let active = true;

    async function loadDesigner() {
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

        if (
          profileError ||
          !profile ||
          profile.role?.toUpperCase() !== "INTERIOR_DESIGNER"
        ) {
          router.replace("/login");
          return;
        }

        if (!active) return;

        setUserId(user.id);

        setDesignerName(
          profile.name || user.user_metadata?.name || "Designer"
        );

        // Retrieve company information.
        const controller =
          new InteriorDesignerCompanyRetrievalController();

        const result = await controller.getCompany(user.id);

        if (!active) return;

        if (!result.success) {
          console.error("Unable to load company:", result.error);

          setCompanyError(
            result.error || "Unable to retrieve company information."
          );
        } else if (result.company?.company_name) {
          setCompany(result.company);

          setFormData({
            ...emptyCompany,
            ...result.company,
            specialisations: result.company.specialisations || [],
          });
        } else {
          setCompany(null);

          setFormData({
            ...emptyCompany,
            ...(result.company || {}),
            specialisations: result.company?.specialisations || [],
          });

          setShowCompanyForm(true);
        }

        // Retrieve projects and categories through the API.
        await loadProjects(() => active);
      } catch (error) {
        console.error("Unable to load designer dashboard:", error);
        router.replace("/login");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDesigner();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  // ==================================================
  // COMPANY FORM INPUT
  // ==================================================

  function handleInputChange(
    field: keyof CompanyInformation,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]:
        field === "years_of_experience"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  }

  function handleSpecialisationsChange(value: string) {
    const specialisations = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setFormData((previous) => ({
      ...previous,
      specialisations,
    }));
  }

  // ==================================================
  // OPEN COMPANY FORM
  // ==================================================

  function openCompanyForm() {
    setFormData({
      ...emptyCompany,
      ...(company || {}),
      specialisations: company?.specialisations || [],
    });

    setShowCompanyForm(true);
    setCompanyError("");
    setSuccessMessage("");

    document
      .getElementById("company-information")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  // ==================================================
  // RESET COMPANY FORM
  // ==================================================

  function handleResetForm() {
    if (company) {
      setFormData({
        ...emptyCompany,
        ...company,
        specialisations: company.specialisations || [],
      });
    } else {
      setFormData({ ...emptyCompany });
    }

    setCompanyError("");
    setSuccessMessage("");
  }

  // ==================================================
  // CREATE / UPDATE COMPANY
  // ==================================================

  async function handleSaveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCompanyError("");
    setSuccessMessage("");

    if (!userId) {
      setCompanyError("Unable to identify your designer account.");
      return;
    }

    if (!formData.company_name?.trim()) {
      setCompanyError("Please enter your company name.");
      return;
    }

    if (
      formData.years_of_experience !== null &&
      (!Number.isInteger(formData.years_of_experience) ||
        formData.years_of_experience < 0)
    ) {
      setCompanyError("Please enter a valid number of years.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== userId) {
        setCompanyError("Your session is invalid. Please log in again.");
        router.replace("/login");
        return;
      }

      const companyName = formData.company_name.trim();
      const bio = formData.bio?.trim() || null;
      const logoUrl = formData.logo_url?.trim() || null;
      const website = formData.website?.trim() || null;
      const phone = formData.phone?.trim() || null;
      const email = formData.email?.trim() || null;
      const address = formData.address?.trim() || null;
      const yearsOfExperience = formData.years_of_experience;
      const specialisations = formData.specialisations || [];

      let result;

      if (company) {
        const controller =
          new InteriorDesignerCompanyUpdateController();

        result = await controller.updateCompany(
          user.id,
          companyName,
          bio,
          logoUrl,
          website,
          phone,
          email,
          address,
          yearsOfExperience,
          specialisations
        );
      } else {
        const controller =
          new InteriorDesignerCompanyCreationController();

        result = await controller.createCompany(
          user.id,
          companyName,
          bio,
          logoUrl,
          website,
          phone,
          email,
          address,
          yearsOfExperience,
          specialisations
        );
      }

      if (!result.success || !result.company) {
        throw new Error(
          result.error || "Unable to save company information."
        );
      }

      setCompany(result.company);

      setFormData({
        ...emptyCompany,
        ...result.company,
        specialisations: result.company.specialisations || [],
      });

      setShowCompanyForm(false);

      setSuccessMessage(
        "Your company information has been saved successfully."
      );
    } catch (error: unknown) {
      console.error("Unable to save company information:", error);

      setCompanyError(
        error instanceof Error
          ? error.message
          : "Unable to save company information."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==================================================
  // DELETE COMPANY
  // ==================================================

  async function handleDeleteCompany() {
    if (!company || !userId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your company information?"
    );

    if (!confirmed) return;

    setSaving(true);
    setCompanyError("");
    setSuccessMessage("");

    try {
      const controller =
        new InteriorDesignerCompanyDeletionController();

      const result = await controller.deleteCompany(userId);

      if (!result.success) {
        throw new Error(
          result.error || "Unable to delete company information."
        );
      }

      setCompany(null);
      setFormData({ ...emptyCompany });
      setShowCompanyForm(false);

      setSuccessMessage(
        "Your company information has been deleted successfully."
      );
    } catch (error: unknown) {
      console.error("Unable to delete company information:", error);

      setCompanyError(
        error instanceof Error
          ? error.message
          : "Unable to delete company information."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==================================================
  // PROJECT FORM INPUT
  // ==================================================

  function handleProjectInputChange(
    field: keyof IDPFormData,
    value: string
  ) {
    setProjectForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // ==================================================
  // OPEN CREATE PROJECT FORM
  // ==================================================

  function openCreateProjectForm() {
    setEditingProject(null);
    setProjectForm({ ...emptyProjectForm });
    setProjectError("");
    setProjectSuccess("");
    setShowProjectForm(true);

    document
      .getElementById("my-projects")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  // ==================================================
  // OPEN EDIT PROJECT FORM
  // ==================================================

  function openEditProjectForm(project: IDPProject) {
    setEditingProject(project);

    setProjectForm({
      title: project.title,
      description: project.description || "",
      categoryId: project.categoryId,
      budget:
        project.budget !== null ? String(project.budget) : "",
      coverImage: project.coverImage || "",
      status: project.status,
    });

    setProjectError("");
    setProjectSuccess("");
    setShowProjectForm(true);

    document
      .getElementById("my-projects")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  // ==================================================
  // CLOSE PROJECT FORM
  // ==================================================

  function closeProjectForm() {
    setShowProjectForm(false);
    setEditingProject(null);
    setProjectForm({ ...emptyProjectForm });
    setProjectError("");
  }

  // ==================================================
  // CREATE / UPDATE PROJECT
  // ==================================================

  async function handleSaveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProjectError("");
    setProjectSuccess("");

    if (!projectForm.title.trim()) {
      setProjectError("Please enter a project title.");
      return;
    }

    if (!projectForm.categoryId) {
      setProjectError("Please select a project category.");
      return;
    }

    const budget =
      projectForm.budget.trim() === ""
        ? null
        : Number(projectForm.budget);

    if (
      budget !== null &&
      (!Number.isFinite(budget) || budget < 0)
    ) {
      setProjectError("Please enter a valid project budget.");
      return;
    }

    setProjectSaving(true);

    try {
      const endpoint = editingProject
        ? `/api/idp/designer-projects/${editingProject.id}`
        : "/api/idp/designer-projects";

      const response = await fetch(endpoint, {
        method: editingProject ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: projectForm.title.trim(),
          description: projectForm.description.trim() || null,
          categoryId: projectForm.categoryId,
          budget,
          coverImage: projectForm.coverImage.trim() || null,
          images: editingProject?.images || [],
          status: projectForm.status,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to save your project."
        );
      }

      setShowProjectForm(false);
      setEditingProject(null);
      setProjectForm({ ...emptyProjectForm });

      setProjectSuccess(
        editingProject
          ? "Your project has been updated successfully."
          : "Your project has been created successfully."
      );

      await loadProjects();
    } catch (error) {
      console.error("Unable to save project:", error);

      setProjectError(
        error instanceof Error
          ? error.message
          : "Unable to save your project."
      );
    } finally {
      setProjectSaving(false);
    }
  }

  // ==================================================
  // DELETE PROJECT
  // ==================================================

  async function handleDeleteProject(project: IDPProject) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"?`
    );

    if (!confirmed) return;

    setProjectError("");
    setProjectSuccess("");

    try {
      const response = await fetch(
        `/api/idp/designer-projects/${project.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to delete your project."
        );
      }

      setProjectSuccess("Your project has been deleted successfully.");

      await loadProjects();
    } catch (error) {
      console.error("Unable to delete project:", error);

      setProjectError(
        error instanceof Error
          ? error.message
          : "Unable to delete your project."
      );
    }
  }

  // ==================================================
  // LOGOUT
  // ==================================================

  async function handleLogout() {
    setSigningOut(true);

    try {
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
  // COMPANY PROFILE COMPLETION
  // ==================================================

  const companyFields = [
    company?.company_name,
    company?.bio,
    company?.website,
    company?.phone,
    company?.email,
    company?.address,
    company?.years_of_experience,
    company?.specialisations?.length
      ? company.specialisations.join(", ")
      : null,
  ];

  const completedFields = companyFields.filter(
    (field) => field !== null && field !== undefined && field !== ""
  ).length;

  const profileCompletion = Math.round(
    (completedFields / companyFields.length) * 100
  );

  // ==================================================
  // LOADING STATE
  // ==================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <p className="text-sm text-gray-400">Loading...</p>
      </main>
    );
  }

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#252525]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white px-6 py-8 md:flex">
          <Link href="/" className="mb-12 text-2xl font-bold tracking-tight">
            space<span className="text-[#9a8065]">.</span>
          </Link>

          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Workspace
          </p>

          <nav className="space-y-2">
            <Link
              href="/InteriorDesignerDashboard"
              className="flex items-center gap-3 rounded-xl bg-[#f5f3ef] px-4 py-3 text-sm font-medium"
            >
              <span>⌂</span>
              Overview
            </Link>

            <button
              type="button"
              onClick={openCompanyForm}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-gray-500 transition hover:bg-[#f5f3ef]"
            >
              <span>▣</span>
              Company Information
            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("my-projects")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-gray-500 transition hover:bg-[#f5f3ef]"
            >
              <span>◫</span>
              My Projects
              <span className="ml-auto text-[10px]">
                {projects.length}
              </span>
            </button>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400">
              <span>▤</span>
              Statistics
              <span className="ml-auto text-[10px]">Soon</span>
            </div>
          </nav>

          <div className="mt-auto border-t border-black/5 pt-6">
            <p className="text-sm font-medium">{designerName}</p>

            <p className="mt-1 text-xs text-gray-400">
              Interior Designer
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

        {/* MAIN CONTENT */}

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
              Interior Designer Workspace
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
              View Marketplace ↗
            </Link>
          </header>

          {/* WELCOME */}

          <section className="mb-12">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a8065]">
              DESIGNER WORKSPACE
            </p>

            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Welcome back, {designerName}.
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Manage your company profile and interior design projects.
            </p>
          </section>

          {/* COMPANY SUCCESS AND ERROR MESSAGES */}

          {successMessage && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {companyError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {companyError}
            </div>
          )}

          {/* CREATE / EDIT COMPANY FORM */}

          {showCompanyForm && (
            <section
              id="company-information"
              className="mb-8 rounded-2xl border border-black/5 bg-white p-6 sm:p-8"
            >
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8065]">
                    COMPANY REGISTRATION
                  </p>

                  <h2 className="mt-3 text-2xl font-medium">
                    {company
                      ? "Edit company information"
                      : "Create your company"}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Provide your company details to establish your presence on the platform.
                  </p>
                </div>

                {company && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompanyForm(false);

                      setFormData({
                        ...emptyCompany,
                        ...company,
                        specialisations: company.specialisations || [],
                      });

                      setCompanyError("");
                    }}
                    className="rounded-full border border-black/10 px-5 py-2.5 text-sm transition hover:bg-[#f5f3ef]"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCompany} className="space-y-6">

                {/* COMPANY NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.company_name || ""}
                    onChange={(event) =>
                      handleInputChange("company_name", event.target.value)
                    }
                    placeholder="Enter your company name"
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company Description
                  </label>

                  <textarea
                    rows={4}
                    value={formData.bio || ""}
                    onChange={(event) =>
                      handleInputChange("bio", event.target.value)
                    }
                    placeholder="Tell customers about your company and services..."
                    className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                  />
                </div>

                {/* LOGO */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company Logo URL
                  </label>

                  <input
                    type="url"
                    value={formData.logo_url || ""}
                    onChange={(event) =>
                      handleInputChange("logo_url", event.target.value)
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                  />
                </div>

                {/* WEBSITE AND EMAIL */}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Company Website
                    </label>

                    <input
                      type="url"
                      value={formData.website || ""}
                      onChange={(event) =>
                        handleInputChange("website", event.target.value)
                      }
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Company Email
                    </label>

                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(event) =>
                        handleInputChange("email", event.target.value)
                      }
                      placeholder="company@example.com"
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    />
                  </div>
                </div>

                {/* PHONE AND EXPERIENCE */}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Contact Number
                    </label>

                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(event) =>
                        handleInputChange("phone", event.target.value)
                      }
                      placeholder="+65 1234 5678"
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Years of Experience
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.years_of_experience ?? ""}
                      onChange={(event) =>
                        handleInputChange(
                          "years_of_experience",
                          event.target.value
                        )
                      }
                      placeholder="e.g. 5"
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    />
                  </div>
                </div>

                {/* ADDRESS */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company Address
                  </label>

                  <textarea
                    rows={2}
                    value={formData.address || ""}
                    onChange={(event) =>
                      handleInputChange("address", event.target.value)
                    }
                    placeholder="Enter your company address"
                    className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                  />
                </div>

                {/* SPECIALISATIONS */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Specialisations
                  </label>

                  <input
                    type="text"
                    value={formData.specialisations?.join(", ") || ""}
                    onChange={(event) =>
                      handleSpecialisationsChange(event.target.value)
                    }
                    placeholder="Residential, Commercial, Minimalist"
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Separate each specialisation with a comma.
                  </p>
                </div>

                {/* SUBMIT, RESET AND DELETE */}

                <div className="flex flex-col gap-3 border-t border-black/5 pt-6 sm:flex-row">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-[#252525] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#9a8065] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {saving
                      ? "Saving..."
                      : company
                        ? "Update Company Information"
                        : "Create Company"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    disabled={saving}
                    className="w-full rounded-xl border border-black/10 px-6 py-4 text-sm font-medium text-gray-600 transition hover:bg-[#f5f3ef] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    Reset Form
                  </button>

                  {company && (
                    <button
                      type="button"
                      onClick={handleDeleteCompany}
                      disabled={saving}
                      className="w-full rounded-xl border border-red-200 px-6 py-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {saving ? "Processing..." : "Delete Company"}
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* COMPANY PROFILE */}

          {!showCompanyForm && (
            <section
              id="company-information"
              className="mb-8 rounded-2xl border border-black/5 bg-white p-6 sm:p-8"
            >
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8065]">
                    COMPANY PROFILE
                  </p>

                  <h2 className="mt-4 text-2xl font-medium">
                    {company?.company_name || "Your company"}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                    {company?.bio ||
                      "Add information about your interior design company."}
                  </p>
                </div>

                {company?.logo_url && (
                  <img
                    src={company.logo_url}
                    alt="Company logo"
                    className="h-20 w-20 rounded-xl border border-black/5 object-cover"
                  />
                )}
              </div>

              <div className="mt-8 border-t border-black/5 pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Profile completion
                  </p>

                  <p className="text-sm font-medium text-[#9a8065]">
                    {profileCompletion}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#f0eee9]">
                  <div
                    className="h-full rounded-full bg-[#9a8065] transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={openCompanyForm}
                className="mt-6 rounded-xl bg-[#252525] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a8065]"
              >
                Edit Company Information
              </button>
            </section>
          )}

          {/* COMPANY DETAILS */}

          {company && !showCompanyForm && (
            <section className="mb-8">
              <h2 className="mb-5 text-lg font-medium">
                Company Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Company Email", company.email],
                  ["Contact Number", company.phone],
                  ["Website", company.website],
                  [
                    "Years of Experience",
                    company.years_of_experience != null
                      ? `${company.years_of_experience} years`
                      : null,
                  ],
                  ["Company Address", company.address],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-black/5 bg-white p-6"
                  >
                    <p className="text-xs text-gray-400">{label}</p>

                    <p className="mt-3 break-words text-sm font-medium">
                      {value || "Not provided"}
                    </p>
                  </div>
                ))}
              </div>

              {company.specialisations &&
                company.specialisations.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6">
                    <p className="text-xs text-gray-400">
                      Specialisations
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {company.specialisations.map((specialisation) => (
                        <span
                          key={specialisation}
                          className="rounded-full bg-[#f5f3ef] px-4 py-2 text-xs font-medium"
                        >
                          {specialisation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </section>
          )}

          {/* ==================================================
              MY PROJECTS
          ================================================== */}

          <section id="my-projects" className="mb-12 scroll-mt-8">

            {/* PROJECT SECTION HEADER */}

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8065]">
                  PORTFOLIO
                </p>

                <h2 className="text-2xl font-medium">
                  My Projects
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Create and manage your interior design portfolio.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateProjectForm}
                className="rounded-xl bg-[#252525] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a8065]"
              >
                + Add Project
              </button>
            </div>

            {/* PROJECT SUCCESS AND ERROR MESSAGES */}

            {projectSuccess && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {projectSuccess}
              </div>
            )}

            {projectError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {projectError}
              </div>
            )}

            {/* CREATE / EDIT PROJECT FORM */}

            {showProjectForm && (
              <div className="mb-8 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8065]">
                      PROJECT DETAILS
                    </p>

                    <h3 className="mt-3 text-xl font-medium">
                      {editingProject
                        ? "Edit project"
                        : "Create a new project"}
                    </h3>

                    <p className="mt-2 text-sm text-gray-400">
                      Add the details of your interior design project.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeProjectForm}
                    disabled={projectSaving}
                    className="rounded-full border border-black/10 px-5 py-2.5 text-sm transition hover:bg-[#f5f3ef] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={handleSaveProject}
                  className="space-y-6"
                >
                  {/* PROJECT TITLE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Project Title <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={projectForm.title}
                      onChange={(event) =>
                        handleProjectInputChange(
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Modern Minimalist Apartment"
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    />
                  </div>

                  {/* PROJECT CATEGORY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </label>

                    <select
                      required
                      value={projectForm.categoryId}
                      onChange={(event) =>
                        handleProjectInputChange(
                          "categoryId",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    >
                      <option value="">Select a category</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    {categories.length === 0 && (
                      <p className="mt-2 text-xs text-red-500">
                        No project categories are available.
                      </p>
                    )}
                  </div>
                  {/* VISIBILITY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Visibility
                    </label>

                    <select
                      value={projectForm.status}
                      onChange={(event) =>
                        handleProjectInputChange("status", event.target.value)
                      }
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    >
                      <option value="PUBLISHED">Published (visible to customers)</option>
                      <option value="DRAFT">Draft (only visible to you)</option>
                    </select>
                  </div>

                  {/* PROJECT DESCRIPTION */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Project Description
                    </label>

                    <textarea
                      rows={5}
                      value={projectForm.description}
                      onChange={(event) =>
                        handleProjectInputChange(
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Describe the project, design concept, materials and key features..."
                      className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    />
                  </div>

                  {/* BUDGET */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Project Budget
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={projectForm.budget}
                      onChange={(event) =>
                        handleProjectInputChange(
                          "budget",
                          event.target.value
                        )
                      }
                      placeholder="e.g. 50000"
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Enter the project budget. Leave blank if you do not wish to specify it.
                    </p>
                  </div>

                  {/* COVER IMAGE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Cover Image URL
                    </label>

                    <input
                      type="url"
                      value={projectForm.coverImage}
                      onChange={(event) =>
                        handleProjectInputChange(
                          "coverImage",
                          event.target.value
                        )
                      }
                      placeholder="https://example.com/project-image.jpg"
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#9a8065]"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Provide a publicly accessible image URL.
                    </p>
                  </div>

                  {/* FORM ACTIONS */}

                  <div className="flex flex-col gap-3 border-t border-black/5 pt-6 sm:flex-row">
                    <button
                      type="submit"
                      disabled={projectSaving || categories.length === 0}
                      className="rounded-xl bg-[#252525] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#9a8065] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {projectSaving
                        ? "Saving..."
                        : editingProject
                          ? "Update Project"
                          : "Create Project"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProjectForm(
                          editingProject
                            ? {
                                title: editingProject.title,
                                description:
                                  editingProject.description || "",
                                categoryId: editingProject.categoryId,
                                budget:
                                  editingProject.budget !== null
                                    ? String(editingProject.budget)
                                    : "",
                                coverImage:
                                  editingProject.coverImage || "",
                                  status: editingProject.status,
                              }
                            : { ...emptyProjectForm }
                        );

                        setProjectError("");
                      }}
                      disabled={projectSaving}
                      className="rounded-xl border border-black/10 px-6 py-4 text-sm font-medium text-gray-600 transition hover:bg-[#f5f3ef] disabled:opacity-50"
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PROJECT LIST */}

            {projectsLoading ? (
              <div className="rounded-2xl border border-black/5 bg-white p-10 text-center">
                <p className="text-sm text-gray-400">
                  Loading your projects...
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3eee7] text-2xl">
                  ◫
                </div>

                <h3 className="mt-5 text-lg font-medium">
                  No projects yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                  Start building your portfolio by adding your first interior design project.
                </p>

                <button
                  type="button"
                  onClick={openCreateProjectForm}
                  className="mt-6 rounded-xl bg-[#252525] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a8065]"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-2xl border border-black/5 bg-white"
                  >
                    {/* PROJECT COVER */}

                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center bg-[#f3eee7] text-3xl text-[#9a8065]">
                        ◫
                      </div>
                    )}

                    {/* PROJECT INFORMATION */}

                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a8065]">
                        {project.category}
                      </p>
                      
                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-medium ${
                          project.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700"
                            : "bg-[#f5f3ef] text-gray-500"
                        }`}
                      >
                        {project.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>

                      <h3 className="mt-2 text-lg font-medium">
                        {project.title}
                      </h3>

                      <p className="mt-2 min-h-12 text-sm leading-6 text-gray-400">
                        {project.description || "No description provided."}
                      </p>

                      <div className="mt-5 border-t border-black/5 pt-4">
                        <p className="text-xs text-gray-400">
                          Project Budget
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {project.budget !== null
                            ? project.budget.toLocaleString("en-SG", {
                                style: "currency",
                                currency: "SGD",
                                maximumFractionDigits: 2,
                              })
                            : "Not specified"}
                        </p>
                      </div>

                      {/* PROJECT ACTIONS */}

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openEditProjectForm(project)
                          }
                          className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-sm font-medium transition hover:bg-[#f5f3ef]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProject(project)
                          }
                          className="flex-1 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* WORKSPACE OVERVIEW */}

          <section>
            <h2 className="mb-5 text-lg font-medium">
              Your workspace
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* COMPANY INFORMATION CARD */}

              <div className="rounded-2xl border border-black/5 bg-white p-6">
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eee7] text-xl">
                  ▣
                </div>

                <h3 className="font-medium">
                  Company Information
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Manage your company's profile, contact details and specialisations.
                </p>

                <button
                  type="button"
                  onClick={openCompanyForm}
                  className="mt-6 text-sm font-medium text-[#9a8065] hover:underline"
                >
                  Manage Company →
                </button>
              </div>

              {/* PROJECT MANAGEMENT CARD */}

              <div className="rounded-2xl border border-black/5 bg-white p-6">
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eee7] text-xl">
                  ◫
                </div>

                <h3 className="font-medium">
                  Interior Design Projects
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Manage your interior design portfolio and project information.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("my-projects")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="mt-6 text-sm font-medium text-[#9a8065] hover:underline"
                >
                  Manage Projects ({projects.length}) →
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER */}

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