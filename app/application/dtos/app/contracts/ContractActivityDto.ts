import { ContractActivityType } from "~/application/enums/app/contracts/ContractActivityType";
import { AppWorkspaceEntityDto } from "../../core/AppWorkspaceEntityDto";
import { ContractDto } from "./ContractDto";

export interface ContractActivityDto extends AppWorkspaceEntityDto {
  contractId: string;
  contract: ContractDto;
  type: ContractActivityType;
}
