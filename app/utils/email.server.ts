var postmark = require("postmark");
// import postmark from "postmark";

import { Template, TemplateInList, TemplateTypes } from "postmark/dist/client/models";
import { EmailTemplateDto } from "~/application/dtos/core/email/EmailTemplateDto";

// Send an email:
function getClient() {
  try {
    return new postmark.ServerClient(process.env.REMIX_POSTMARK_SERVER_TOKEN?.toString() ?? "");
  } catch (e: any) {
    console.error(e);
    return null;
  }
}
var from = "Remix SaasFrontend";
var fromEmail = "remix@saasfrontends.com";

export async function sendPlainEmail(to: string, subject: string, textBody: string) {
  const client = getClient();
  if (!client) {
    return;
  }
  client.sendEmail({
    From: fromEmail,
    To: to,
    Subject: subject,
    TextBody: textBody,
  });
}

function getBaseTemplateModel() {
  const appUrl = process.env.REMIX_SERVER_URL?.toString();
  return {
    product_url: appUrl,
    login_url: appUrl + "/login",
    product_name: "Remix SaasFrontend",
    support_email: "saasfrontends@gmail.com",
    sender_name: from,
    company_name: "SaasFrontends",
    company_address: process.env.REMIX_COMPANY_ADDRESS,
  };
}

export async function sendEmail(to: string, alias: string, data: any, Attachments?: { Name: string; Content: string; ContentType: string }[]) {
  const client = getClient();
  if (!client) {
    return;
  }
  await client.sendEmailWithTemplate({
    From: fromEmail,
    To: to,
    TemplateAlias: alias,
    TemplateModel: {
      ...getBaseTemplateModel(),
      ...data,
    },
    Attachments,
  });
}

export async function getPostmarkTemplates() {
  const client = getClient();
  if (!client) {
    return;
  }
  const items: TemplateInList[] = (await client.getTemplates()).Templates;
  const templatesPromises = items.map(async (item: TemplateInList) => {
    const postmarkTemplate: Template = await client.getTemplate(item.Alias ?? "");
    const template: EmailTemplateDto = {
      type: item.TemplateType === TemplateTypes.Standard ? "standard" : "layout",
      name: postmarkTemplate.Name,
      alias: postmarkTemplate.Alias ?? "",
      subject: postmarkTemplate.Subject ?? "",
      htmlBody: postmarkTemplate.HtmlBody ?? "",
      active: postmarkTemplate.Active,
      associatedServerId: postmarkTemplate.AssociatedServerId,
      templateId: postmarkTemplate.TemplateId,
    };
    return template;
  });
  const templates = await Promise.all(templatesPromises);
  return templates;
}

export async function createPostmarkTemplate(template: EmailTemplateDto, layoutTemplate?: string | undefined) {
  const client = getClient();
  if (!client) {
    return;
  }
  return client.createTemplate({
    LayoutTemplate: layoutTemplate,
    TemplateType: template.alias.startsWith("layout-") ? TemplateTypes.Layout : TemplateTypes.Standard,
    Alias: template.alias,
    Name: template.name,
    Subject: template.subject,
    HtmlBody: template.htmlBody,
  });
}
