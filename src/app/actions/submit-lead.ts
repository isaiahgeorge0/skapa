"use server";

import {
  processLeadSubmission,
  type SubmitLeadInput,
  type SubmitLeadResult,
} from "@/lib/submit-lead-core";

export async function submitLead(
  input: SubmitLeadInput,
): Promise<SubmitLeadResult> {
  return processLeadSubmission(input);
}
