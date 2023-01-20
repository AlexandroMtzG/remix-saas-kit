import { ContractStatus } from "~/application/enums/app/contracts/ContractStatus";
import { ContractActivityDto } from "./ContractActivityDto";
import { ContractMemberDto } from "./ContractMemberDto";
import { LinkDto } from "~/application/dtos/core/links/LinkDto";
import { AppWorkspaceEntityDto } from "../../core/AppWorkspaceEntityDto";
import { ContractEmployeeDto } from "./ContractEmployeeDto";

export interface ContractDto extends AppWorkspaceEntityDto {
  name: string;
  description: string;
  linkId: string;
  link: LinkDto;
  hasFile: boolean;
  signedDate?: Date;
  status: ContractStatus;
  members: ContractMemberDto[];
  employees: ContractEmployeeDto[];
  activity: ContractActivityDto[];
}
