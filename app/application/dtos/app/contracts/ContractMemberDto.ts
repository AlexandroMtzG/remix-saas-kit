import { ContractMemberRole } from "~/application/enums/app/contracts/ContractMemberRole";
import { UserDto } from "~/application/dtos/core/users/UserDto";
import { AppWorkspaceEntityDto } from "../../core/AppWorkspaceEntityDto";
import { ContractDto } from "./ContractDto";

export interface ContractMemberDto extends AppWorkspaceEntityDto {
  contractId: string;
  contract: ContractDto;
  role: ContractMemberRole;
  userId: string;
  user: UserDto;
  signDate?: Date;
}
