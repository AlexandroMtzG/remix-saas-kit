import { AppEntityDto } from "./AppEntityDto";
import { WorkspaceDto } from "./workspaces/WorkspaceDto";

export interface AppWorkspaceEntityDto extends AppEntityDto {
  workspaceId?: string;
  workspace?: WorkspaceDto;
}
