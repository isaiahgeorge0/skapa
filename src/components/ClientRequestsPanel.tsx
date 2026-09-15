"use client";

import { useState, useTransition } from "react";
import { submitProjectRequest } from "@/app/actions/project-requests";
import {
  type ProjectRequest,
  type ProjectRequestStatus,
} from "@/lib/project-request-status";

const STATUS_LABELS: Record<ProjectRequestStatus, string> = {
  new: "Received",
  in_review: "In review",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

export default function ClientRequestsPanel({
  projectId,
  initialRequests,
}: {
  projectId: string;
  initialRequests: ProjectRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitProjectRequest(projectId, title, description);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.request) {
        setRequests((curr) => [result.request!, ...curr]);
      }
      setTitle("");
      setDescription("");
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="surface-raised px-6 py-6 md:px-7 md:py-7">
        <p className="font-serif text-xl tracking-tight text-black">
          Need something adding?
        </p>
        <p className="mt-2 max-w-prose font-mono text-sm leading-relaxed text-neutral-500">
          Send a request and we&apos;ll pick it up. Useful for changes, extras, or
          questions that should live with the project.
        </p>
        <label className="mt-5 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            Title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
            placeholder="e.g. Extra landing page"
            className="surface-control mt-2 w-full border border-neutral-200 bg-white px-3.5 py-2.5 font-mono text-sm text-black outline-none focus:border-neutral-400"
          />
        </label>
        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            Details
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What you need, and any timing that matters."
            className="surface-control mt-2 w-full resize-y border border-neutral-200 bg-white px-3.5 py-2.5 font-mono text-sm text-black outline-none focus:border-neutral-400"
          />
        </label>
        {error ? (
          <p className="mt-3 font-mono text-xs text-red-600">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="surface-control mt-5 bg-portal-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send request"}
        </button>
      </form>

      {requests.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No requests yet. When something comes up mid-project, send it here so it
          stays on the record.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
          {requests.map((request) => (
            <li key={request.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-serif text-lg text-black">{request.title}</p>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                  {STATUS_LABELS[request.status] ?? request.status}
                </span>
              </div>
              {request.description ? (
                <p className="mt-1 font-mono text-sm leading-relaxed text-neutral-500">
                  {request.description}
                </p>
              ) : null}
              <p className="mt-2 font-mono text-[10px] text-neutral-400">
                {new Date(request.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {request.admin_response ? (
                <p className="mt-3 border-l-2 border-portal-accent pl-3 font-mono text-sm text-neutral-700">
                  {request.admin_response}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
