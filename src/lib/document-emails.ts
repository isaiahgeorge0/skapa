import { Resend } from "resend";
import { EMAIL_FROM } from "@/lib/email";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendDocumentReadyToSignEmail({
  to,
  documentName,
  projectName,
  signUrl,
}: {
  to: string;
  documentName: string;
  projectName: string;
  signUrl: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `${documentName} is ready for your signature`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <p style="font-family: 'Courier New', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888;">
            skapa Creative
          </p>
          <h1 style="font-size: 24px; font-weight: normal;">
            Document ready to sign
          </h1>
          <p style="color: #333; line-height: 1.6;">
            <strong>${documentName}</strong> for <strong>${projectName}</strong> is ready for your signature.
          </p>
          <p style="margin: 32px 0;">
            <a href="${signUrl}" style="background: #000; color: #fff; padding: 14px 28px; text-decoration: none; font-family: 'Courier New', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
              Review &amp; sign
            </a>
          </p>
          <p style="color: #999; font-size: 13px;">
            You can also open this document any time from your client portal.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send document ready email:", error);
    return { success: false, error: "Failed to send notification email." };
  }
}
