import { LinkStatus } from "~/application/enums/core/links/LinkStatus";
import { WorkspaceDto } from "../workspaces/WorkspaceDto";
import { MasterEntityDto } from "../MasterEntityDto";
import { LinkDto } from "./LinkDto";

export interface LinkInvitationDto extends MasterEntityDto {
  createdByWorkspaceId: string;
  createdByWorkspace: WorkspaceDto;
  email: string;
  workspaceName: string;
  message: string;
  inviteeIsProvider: boolean;
  status: LinkStatus;
  createdLinkId: string | null;
  createdLink: LinkDto;
}
