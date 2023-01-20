import { ContractMemberRole } from "~/application/enums/app/contracts/ContractMemberRole";

export interface AddContractMemberDto {
  name: string;
  email: string;
  userId: string;
  role: ContractMemberRole;
}
