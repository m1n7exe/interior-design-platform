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

// ==================================================
// INTERIOR DESIGNER DASHBOARD
// ==================================================

export default function InteriorDesignerDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // ==================================================
  // STATE MANAGEMENT
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
  // AUTHENTICATION AND LOAD COMPANY INFORMATION
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

        // Retrieve company information through the controller.
        const controller =
          new InteriorDesignerCompanyRetrievalController();

        const result = await controller.getCompany(user.id);

        if (!active) return;

        if (!result.success) {
          console.error("Unable to load company:", result.error);

          setCompanyError(
            result.error || "Unable to retrieve company information."
          );

          return;
        }

        if (result.company?.company_name) {
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
  // HANDLE FORM INPUT
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
  }

  // ==================================================
  // RESET COMPANY FORM
  // ==================================================

  function handleResetForm() {
    if (company) {
      // Restore the last saved company information.
      setFormData({
        ...emptyCompany,
        ...company,
        specialisations: company.specialisations || [],
      });
    } else {
      // Clear the form when creating a new company.
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
      // Verify the authenticated designer.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== userId) {
        setCompanyError("Your session is invalid. Please log in again.");
        router.replace("/login");
        return;
      }

      // Prepare controller parameters.
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
        // Update existing company information.
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
        // Create company information.
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

      // Handle controller response.
      if (!result.success || !result.company) {
        throw new Error(
          result.error || "Unable to save company information."
        );
      }

      // Update boundary state.
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
    if (!company || !userId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your company information?"
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setCompanyError("");
    setSuccessMessage("");

    try {
      // Delete company information through the controller.
      const controller =
        new InteriorDesignerCompanyDeletionController();

      const result = await controller.deleteCompany(userId);

      if (!result.success) {
        throw new Error(
          result.error || "Unable to delete company information."
        );
      }

      // Update boundary state after successful deletion.
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

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400">
              <span>◫</span>
              My Projects
              <span className="ml-auto text-[10px]">Soon</span>
            </div>

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

          {/* SUCCESS AND ERROR MESSAGES */}

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
            <section className="mb-8 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">

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

                  {/* CREATE / UPDATE BUTTON */}

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

                  {/* RESET BUTTON */}

                  <button
                    type="button"
                    onClick={handleResetForm}
                    disabled={saving}
                    className="w-full rounded-xl border border-black/10 px-6 py-4 text-sm font-medium text-gray-600 transition hover:bg-[#f5f3ef] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    Reset Form
                  </button>

                  {/* DELETE BUTTON */}

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
            <section className="mb-8 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">

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
                  Manage your current and past interior design projects.
                </p>

                <p className="mt-6 text-sm font-medium text-gray-400">
                  Project management coming next
                </p>
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