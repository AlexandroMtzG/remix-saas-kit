import { Role } from "~/application/enums/shared/Role";
import { UserDto } from "../../core/users/UserDto";
import { AppEntityDto } from "../AppEntityDto";
import { WorkspaceDto } from "./WorkspaceDto";

export interface WorkspaceUserDto extends AppEntityDto {
  workspaceId: string;
  workspace?: WorkspaceDto;
  userId: string;
  user?: UserDto;
  role: Role;
  default?: boolean;
}
