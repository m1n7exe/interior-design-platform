import { User } from "@/entity/User";
import { Customer } from "@/entity/Customer";
import { InteriorDesigner } from "@/entity/InteriorDesigner";

export class AuthController {
  public async registerCustomer(
    name: string,
    email: string,
    password: string
  ) {
    const { data } = await Customer.register(
      name,
      email,
      password
    );

    return data.user
      ? new Customer(data.user.id, name, email)
      : null;
  }

  public async registerInteriorDesigner(
    name: string,
    email: string,
    password: string,
    companyName: string
  ) {
    const { data } = await InteriorDesigner.register(
      name,
      email,
      password,
      companyName
    );

    return data.user
      ? new InteriorDesigner(
          data.user.id,
          name,
          email,
          companyName
        )
      : null;
  }

  public async login(email: string, password: string) {
    const { data } = await User.login(email, password);

    return data.user;
  }

  public async logout(): Promise<void> {
    await User.logout();
  }
}