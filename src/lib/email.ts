import { Resend } from "resend";

export const EMAIL_FROM = "Skapa Creative <hello@skapa.uk>";

/** Published Resend template aliases. */
export const EMAIL_TEMPLATES = {
  clientPortalInvite: "client-portal-invite",
  documentReadyToSign: "document-ready-to-sign",
  documentSignedConfirmation: "document-signed-confirmation",
  leadThankYou: "lead-thank-you",
  accountReady: "account-ready",
} as const;

type ActionResult = { success: true } | { success: false; error: string };

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://skapa.uk";
}

async function sendTemplate({
  to,
  templateId,
  variables,
  failureMessage,
}: {
  to: string;
  templateId: string;
  variables: Record<string, string | number>;
  failureMessage: string;
}): Promise<ActionResult> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      template: {
        id: templateId,
        variables,
      },
    });

    if (error) {
      console.error(`Resend template ${templateId} failed:`, error);
      return { success: false, error: failureMessage };
    }

    return { success: true };
  } catch (error) {
    console.error(`Resend template ${templateId} failed:`, error);
    return { success: false, error: failureMessage };
  }
}

export async function sendDocumentReadyToSignEmail({
  to,
  clientName,
  documentName,
  projectName,
  signUrl,
}: {
  to: string;
  clientName: string;
  documentName: string;
  projectName: string;
  signUrl: string;
}): Promise<ActionResult> {
  return sendTemplate({
    to,
    templateId: EMAIL_TEMPLATES.documentReadyToSign,
    variables: {
      CLIENT_NAME: clientName,
      PROJECT_NAME: projectName,
      DOCUMENT_NAME: documentName,
      SIGN_URL: signUrl,
    },
    failureMessage: "Failed to send notification email.",
  });
}

export async function sendClientPortalInviteEmail({
  to,
  clientName,
  projectName,
  inviteUrl,
}: {
  to: string;
  clientName: string;
  projectName: string;
  inviteUrl: string;
}): Promise<ActionResult> {
  return sendTemplate({
    to,
    templateId: EMAIL_TEMPLATES.clientPortalInvite,
    variables: {
      CLIENT_NAME: clientName,
      PROJECT_NAME: projectName,
      INVITE_URL: inviteUrl,
    },
    failureMessage: "Failed to send invite email.",
  });
}

export async function sendAccountReadyEmail({
  to,
  clientName,
  loginUrl,
}: {
  to: string;
  clientName: string;
  loginUrl?: string;
}): Promise<ActionResult> {
  return sendTemplate({
    to,
    templateId: EMAIL_TEMPLATES.accountReady,
    variables: {
      CLIENT_NAME: clientName,
      LOGIN_URL: loginUrl ?? `${siteUrl()}/login`,
    },
    failureMessage: "Failed to send account-ready email.",
  });
}

export async function sendLeadThankYouEmail({
  to,
  leadName,
}: {
  to: string;
  leadName: string;
}): Promise<ActionResult> {
  return sendTemplate({
    to,
    templateId: EMAIL_TEMPLATES.leadThankYou,
    variables: {
      LEAD_NAME: leadName,
    },
    failureMessage: "Failed to send lead thank-you email.",
  });
}

export async function sendDocumentSignedConfirmationEmail({
  to,
  clientName,
  documentName,
  projectName,
  signedDate,
  portalUrl,
}: {
  to: string;
  clientName: string;
  documentName: string;
  projectName: string;
  signedDate: string;
  portalUrl: string;
}): Promise<ActionResult> {
  return sendTemplate({
    to,
    templateId: EMAIL_TEMPLATES.documentSignedConfirmation,
    variables: {
      CLIENT_NAME: clientName,
      DOCUMENT_NAME: documentName,
      PROJECT_NAME: projectName,
      SIGNED_DATE: signedDate,
      PORTAL_URL: portalUrl,
    },
    failureMessage: "Failed to send document signed confirmation email.",
  });
}

export function formatSignedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function portalDocumentsUrl(projectId: string): string {
  return `${siteUrl()}/portal/projects/${projectId}/documents`;
}
