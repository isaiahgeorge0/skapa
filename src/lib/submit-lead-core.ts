"use server";

import { getClientIp } from "@/lib/client-ip";
import { sendLeadThankYouEmail } from "@/lib/email";
import { assertLeadRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { withTimeout } from "@/lib/with-timeout";

export type SubmitLeadResult =
  | { success: true }
  | { success: false; error: string };

type ContactLeadInput = {
  source: "contact_form";
  name: string;
  email: string;
  message: string;
  /** Hidden field real users never fill in. Non-empty = bot. */
  honeypot?: string;
  /** Server-clock Date.now() from the page render, so we can reject instant submits. */
  startedAt?: number;
};

type QuestionnaireLeadInput = {
  source: "questionnaire";
  name: string;
  email: string;
  message: string | null;
  answers: {
    brandName: string;
    need: string;
    trigger: string;
    budget: string;
    timeline: string;
    extra: string;
  };
  /** Hidden field real users never fill in. Non-empty = bot. */
  honeypot?: string;
  /** Server-clock Date.now() from the page render, so we can reject instant submits. */
  startedAt?: number;
};

export type SubmitLeadInput = ContactLeadInput | QuestionnaireLeadInput;

const DB_TIMEOUT_MS = 8_000;

/**
 * Minimum time between a form rendering and being submitted. Scripted bots
 * that POST straight to this endpoint typically fire within a few hundred ms
 * of "loading" the page (or skip loading it at all); a real person can't
 * read the form and fill in a name/email that fast.
 */
const MIN_FILL_MS = 1_500;

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

/**
 * Cheap pre-check before any DB call: a filled honeypot or an implausibly
 * fast submission means this didn't come from a real person filling in the
 * form, regardless of what the rate limiter would say. We return a fake
 * success for these (see processLeadSubmission) rather than an error, so a
 * scripted bot gets no signal to tell it what tripped and adjust.
 */
function looksLikeBot(honeypot: string | undefined, startedAt: number | undefined): boolean {
  if (honeypot && honeypot.trim().length > 0) return true;
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) return true;
  return Date.now() - startedAt < MIN_FILL_MS;
}

async function sendLeadThankYouAfterInsert(email: string, name: string) {
  const result = await sendLeadThankYouEmail({ to: email, leadName: name });
  if (!result.success) {
    // Lead is already stored — don't fail the submission if the email misses.
    console.error("Lead thank-you email failed:", result.error);
  }
}

export async function processLeadSubmission(
  input: SubmitLeadInput,
): Promise<SubmitLeadResult> {
  try {
    if (looksLikeBot(input.honeypot, input.startedAt)) {
      return { success: true };
    }

    const name = input.name.trim();
    const email = input.email.trim();

    if (!name) {
      return { success: false, error: "Please enter your name." };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const ip = await getClientIp();
    const rate = await withTimeout(
      assertLeadRateLimit(ip),
      DB_TIMEOUT_MS,
      "The request took too long. Please try again.",
    );
    if (!rate.ok) {
      return { success: false, error: rate.message };
    }

    const admin = createAdminClient();

    if (input.source === "contact_form") {
      const { error } = await withTimeout(
        Promise.resolve(
          admin.from("leads").insert({
            name,
            email,
            message: input.message.trim() || null,
            source: "contact_form",
          }),
        ),
        DB_TIMEOUT_MS,
        "The request took too long. Please try again.",
      );

      if (error) {
        console.error("contact lead insert failed:", error);
        return {
          success: false,
          error: "Something went wrong. Please try again.",
        };
      }

      await sendLeadThankYouAfterInsert(email, name);
      return { success: true };
    }

    const { error } = await withTimeout(
      Promise.resolve(
        admin.from("leads").insert({
          name,
          email,
          message: input.message,
          source: "questionnaire",
          answers: input.answers,
        }),
      ),
      DB_TIMEOUT_MS,
      "The request took too long. Please try again.",
    );

    if (error) {
      console.error("questionnaire lead insert failed:", error);
      return {
        success: false,
        error: "Something went wrong. Please try again.",
      };
    }

    await sendLeadThankYouAfterInsert(email, name);
    return { success: true };
  } catch (error) {
    console.error("processLeadSubmission unexpected failure:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
