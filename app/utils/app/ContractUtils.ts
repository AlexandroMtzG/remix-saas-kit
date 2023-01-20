import { i18n } from "~/locale/i18n.server";
import { AppLoaderData, loadAppData } from "../data/useAppData";
import { ContractWithDetails } from "../db/contracts.db.server";
import { sendEmail } from "../email.server";

export async function sendContract(request: Request, contract: ContractWithDetails) {
  let t = await i18n.getFixedT(request, "translations");
  const appData = await loadAppData(request);

  const membersJson =
    contract?.members.map((f) => {
      return {
        email: f.user.email,
        first_name: f.user.firstName,
        last_name: f.user.lastName,
        role: f.role === 0 ? t("app.contracts.signatory") : t("app.contracts.spectator"),
      };
    }) ?? [];

  const employeesJson =
    contract?.employees.map((f) => {
      return {
        email: f.employee.email,
        first_name: f.employee.firstName,
        last_name: f.employee.lastName,
      };
    }) ?? [];

  contract.members.forEach(async (member) => {
    await sendEmail(
      `${member.user.firstName} ${member.user.lastName} <${member.user.email}>`,
      "contract-new",
      {
        action_url: process.env.REMIX_SERVER_URL + `/app/contract/${contract.id}`,
        user_creator_firstName: appData.user?.firstName,
        user_creator_email: appData.user?.email,
        contract_name: contract.name,
        workspace_creator: contract.link.createdByWorkspace.name,
        workspace_provider: contract.link.providerWorkspace.name,
        workspace_client: contract.link.clientWorkspace.name,
        contract_description: contract.description,
        members: membersJson,
        employees: employeesJson,
      },
      [
        {
          Name: contract.name + ".pdf",
          Content: contract.file.replace("data:application/pdf;base64,", ""),
          ContentType: "application/pdf",
        },
      ]
    );
  });
}
