import { UserDto } from "~/application/dtos/core/users/UserDto";

export interface EntityDto {
  id: any | string | undefined;
  createdAt?: Date;
  createdByUserId?: string;
  createdByUser?: UserDto;
  modifiedAt?: Date;
}
