import { InteriorDesignerCompany } from "@/entity/InteriorDesignerCompany";

// Handles company creation
export class InteriorDesignerCompanyCreationController {
  public async createCompany(
    userId: string,
    companyName: string,
    bio: string | null,
    logoUrl: string | null,
    website: string | null,
    phone: string | null,
    email: string | null,
    address: string | null,
    yearsOfExperience: number | null,
    specialisations: string[]
  ) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!companyName.trim()) {
      throw new Error("Company name is required.");
    }

    if (
      yearsOfExperience !== null &&
      (yearsOfExperience < 0 || !Number.isInteger(yearsOfExperience))
    ) {
      throw new Error("Years of experience must be a valid non-negative integer.");
    }

    const { data, error } = await InteriorDesignerCompany.create(
      userId,
      companyName.trim(),
      bio,
      logoUrl,
      website,
      phone,
      email,
      address,
      yearsOfExperience,
      specialisations
    );

    return {
      success: !error,
      company: data ?? null,
      error: error?.message ?? null,
    };
  }
}

// Handles company retrieval
export class InteriorDesignerCompanyRetrievalController {
  public async getCompany(userId: string) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const { data, error } =
      await InteriorDesignerCompany.getByUserId(userId);

    return {
      success: !error,
      company: data ?? null,
      error: error?.message ?? null,
    };
  }
}

// Handles company updates
export class InteriorDesignerCompanyUpdateController {
  public async updateCompany(
    userId: string,
    companyName: string,
    bio: string | null,
    logoUrl: string | null,
    website: string | null,
    phone: string | null,
    email: string | null,
    address: string | null,
    yearsOfExperience: number | null,
    specialisations: string[]
  ) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!companyName.trim()) {
      throw new Error("Company name is required.");
    }

    if (
      yearsOfExperience !== null &&
      (yearsOfExperience < 0 || !Number.isInteger(yearsOfExperience))
    ) {
      throw new Error("Years of experience must be a valid non-negative integer.");
    }

    const { data, error } = await InteriorDesignerCompany.update(
      userId,
      companyName.trim(),
      bio,
      logoUrl,
      website,
      phone,
      email,
      address,
      yearsOfExperience,
      specialisations
    );

    return {
      success: !error,
      company: data ?? null,
      error: error?.message ?? null,
    };
  }
}

// Handles company deletion
export class InteriorDesignerCompanyDeletionController {
  public async deleteCompany(userId: string) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const { error } = await InteriorDesignerCompany.delete(userId);

    return {
      success: !error,
      error: error?.message ?? null,
    };
  }
}