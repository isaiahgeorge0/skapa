"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  archiveProjects,
  unarchiveProjects,
} from "@/app/actions/project-archive";

export default function ProjectArchiveControl({
  projectId,
  initialArchivedAt,
}: {
  projectId: string;
  initialArchivedAt: string | null;
}) {
  const router = useRouter();
  const [archivedAt, setArchivedAt] = useState(initialArchivedAt);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setArchivedAt(initialArchivedAt);
  }, [initialArchivedAt]);

  const isArchived = Boolean(archivedAt);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const previous = archivedAt;
      const result = isArchived
        ? await unarchiveProjects([projectId])
        : await archiveProjects([projectId]);

      if (!result.success) {
        setError(result.error);
        setArchivedAt(previous);
        return;
      }

      setArchivedAt(result.archivedAt);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="border border-neutral-300 bg-white px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:border-black hover:text-black disabled:opacity-50"
      >
        {isPending
          ? isArchived
            ? "Unarchiving…"
            : "Archiving…"
          : isArchived
            ? "Unarchive"
            : "Archive"}
      </button>
      {isArchived ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          Archived — hidden from default list
        </p>
      ) : null}
      {error ? (
        <p className="font-mono text-[10px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
