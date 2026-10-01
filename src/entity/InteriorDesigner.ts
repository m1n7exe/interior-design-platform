import { User } from "./User";

export class InteriorDesigner extends User {
  private companyName: string;
  private bio: string;

  constructor(
    id: string,
    name: string,
    email: string,
    companyName: string,
    bio: string
  ) {
    super(id, name, email);

    this.companyName = companyName;
    this.bio = bio;
  }

  public getRole(): string {
    return "INTERIOR_DESIGNER";
  }

  public getCompanyName(): string {
    return this.companyName;
  }

  public getBio(): string {
    return this.bio;
  }
}