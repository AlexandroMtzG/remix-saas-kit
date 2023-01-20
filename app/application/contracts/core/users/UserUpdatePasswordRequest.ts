export interface UserUpdatePasswordRequest {
  passwordCurrent: string;
  passwordNew: string;
  passwordConfirm: string;
}
