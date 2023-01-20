export interface CreateLinkInvitationRequest {
  email: string;
  workspaceName: string;
  message: string;
  inviteeIsProvider: boolean;
}
