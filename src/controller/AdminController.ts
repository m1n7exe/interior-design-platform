import "server-only";

import { Admin } from "@/entity/Admin";

export class AdminController {
  public async createAccount(
    name: string,
    email: string,
    password: string,
    role: "CUSTOMER" | "INTERIOR_DESIGNER"
  ) {
    const { data, error } = await Admin.createAccount(
      name,
      email,
      password,
      role
    );

    return {
      success: !error,
      user: data.user,
      error: error?.message ?? null,
    };
  }
  
  public async updateAccount(
    id: string,
    name: string,
    email: string,
    role: "CUSTOMER" | "INTERIOR_DESIGNER"
  ) {
    const { data, error } = await Admin.updateAccount(
      id,
      name,
      email,
      role
    );

    return {
      success: !error,
      user: data.user,
      error: error?.message ?? null,
    };
  }

  public async deleteAccount(id: string) {
    const { error } = await Admin.deleteAccount(id);

    return {
      success: !error,
      error: error?.message ?? null,
    };
  }

  public async getAccounts() {
    const { data, error } = await Admin.getAccounts();

    return {
      success: !error,
      users: data.users,
      error: error?.message ?? null,
    };
  }
}