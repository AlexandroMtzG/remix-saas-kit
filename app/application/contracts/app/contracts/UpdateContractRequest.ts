import { ContractStatus } from "~/application/enums/app/contracts/ContractStatus";

export interface UpdateContractRequest {
  name?: string;
  status?: ContractStatus;
  description?: string;
  file?: string;
}
