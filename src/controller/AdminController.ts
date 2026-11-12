import "server-only";

import { Admin } from "@/entity/Admin";

// Handles account creation
export class AdminAccountController {
  public async createAccount(
    name: string,
    email: string,
    password: string,
    role: "CUSTOMER" | "INTERIOR_DESIGNER" | "PLATFORM_MANAGEMENT"
  ) {
    const { data, error } = await Admin.createAccount(
      name,
      email,
      password,
      role
    );

    return {
      success: !error,
      user: data?.user ?? null,
      error: error?.message ?? null,
    };
  }
}

// Handles account deletion
export class AdminDeletionController {
  public async deleteAccount(id: string) {
    const { error } = await Admin.deleteAccount(id);

    return {
      success: !error,
      error: error?.message ?? null,
    };
  }
}

// Handles account retrieval
export class AdminRetrievalController {
  public async getAccounts() {
    const { data, error } = await Admin.getAccounts();

    return {
      success: !error,
      users: data?.users ?? [],
      error: error?.message ?? null,
    };
  }
  public async getAccount(id: string) {
    const { data, error } = await Admin.getAccount(id);

    return {
      success: !error && !!data,
      profile: data ?? null,
      error: error?.message ?? null,
    };
  }
}

// Handles account updates.
export class AdminUpdateController {
  public async updateAccount(
    id: string,
    updates: {
      name?: string;
      email?: string;
      password?: string;
      username?: string | null;
      phoneNumber?: string | null;
      location?: string | null;
      profilePhotoUrl?: string | null;
    
    }
  ) {
    return await Admin.updateAccount(id, updates);
  }
}