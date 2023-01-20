import { MasterEntityDto } from "../MasterEntityDto";
import { UserDto } from "../users/UserDto";
import { ContractDto } from "../../app/contracts/ContractDto";
import { WorkspaceDto } from "../workspaces/WorkspaceDto";
import { LinkStatus } from "~/application/enums/core/links/LinkStatus";

export interface LinkDto extends MasterEntityDto {
  createdByUserId: string;
  createdByUser: UserDto;
  createdByWorkspaceId: string;
  createdByWorkspace: WorkspaceDto;
  providerWorkspaceId: string;
  providerWorkspace: WorkspaceDto;
  clientWorkspaceId: string;
  clientWorkspace: WorkspaceDto;
  status: LinkStatus;
  contracts?: ContractDto[];
}
