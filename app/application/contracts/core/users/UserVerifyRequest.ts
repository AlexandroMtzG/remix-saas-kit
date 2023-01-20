import { UserLoginType } from "~/application/enums/core/users/UserLoginType";

export interface UserVerifyRequest {
  token: string;
  email: string;
  password: string;
  passwordConfirm: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userLoginType?: UserLoginType;
}
