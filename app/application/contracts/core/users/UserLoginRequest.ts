import { UserLoginType } from "~/application/enums/core/users/UserLoginType";

export interface UserLoginRequest {
  email: string;
  password: string;
  loginType?: UserLoginType;
}
