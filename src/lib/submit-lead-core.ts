"use server";

import { getClientIp } from "@/lib/client-ip";
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
};

export type SubmitLeadInput = ContactLeadInput | QuestionnaireLeadInput;

const DB_TIMEOUT_MS = 8_000;

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

export async function processLeadSubmission(
  input: SubmitLeadInput,
): Promise<SubmitLeadResult> {
  try {
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

    return { success: true };
  } catch (error) {
    console.error("processLeadSubmission unexpected failure:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
