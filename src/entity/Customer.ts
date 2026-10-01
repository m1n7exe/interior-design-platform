import { User } from "./User";

export class Customer extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email);
  }

  public getRole(): string {
    return "CUSTOMER";
  }
}