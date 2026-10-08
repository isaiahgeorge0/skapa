import PhaseTracker from "@/components/PhaseTracker";
import { PHASES, phaseProgressPercent, type Phase } from "@/lib/project-phases";

export default function PortalNowHero({ projectId, phase }: { projectId: string; phase: Phase }) {
  const current = PHASES.find((p) => p.key === phase) ?? PHASES[0];
  const percent = phaseProgressPercent(phase);

  return (
    <section
      aria-labelledby="portal-now-heading"
      className="surface-raised px-4 py-5 sm:px-6 sm:py-8 md:px-8 md:py-11"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="min-w-0 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-portal-accent">
            Now
          </p>
          <h2
            id="portal-now-heading"
            className="mt-2 font-serif text-3xl leading-[1.05] tracking-tight text-black sm:mt-3 sm:text-4xl md:text-5xl lg:text-[3.25rem]"
          >
            {current.label}
          </h2>
          <p className="mt-3 line-clamp-2 max-w-prose font-serif text-base italic leading-snug text-neutral-500 sm:mt-4 sm:line-clamp-none sm:text-lg md:text-xl">
            {current.description}
          </p>
        </div>

        <div className="w-full shrink-0 border-t border-black/[0.04] pt-4 lg:max-w-[14rem] lg:border-t-0 lg:pt-0">
          <div className="flex items-end justify-between gap-4 lg:block">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
                Progress
              </p>
              <p className="mt-1 font-serif text-3xl tracking-tight text-black tabular-nums sm:mt-2 sm:text-4xl md:text-5xl">
                {percent}
                <span className="text-xl text-neutral-400 sm:text-2xl md:text-3xl">%</span>
              </p>
            </div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 lg:mb-0 lg:mt-2.5">
              Overall project
            </p>
          </div>
          <div
            className="progress-track mt-3 lg:mt-4"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Project phase progress"
          >
            <div
              className="progress-fill bg-portal-accent transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(percent, percent > 0 ? 2 : 0)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-black/[0.04] pt-5 sm:mt-8 sm:pt-7">
        <PhaseTracker
          projectId={projectId}
          initialPhase={phase}
          readOnly
          usePortalAccent
          showNow={false}
          compact
        />
      </div>
    </section>
  );
}
