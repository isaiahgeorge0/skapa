import { PHASES, phaseProgressPercent, type Phase } from "@/lib/project-phases";

export default function PortalNowHero({ phase }: { phase: Phase }) {
  const current = PHASES.find((p) => p.key === phase) ?? PHASES[0];
  const percent = phaseProgressPercent(phase);

  return (
    <section
      aria-labelledby="portal-now-heading"
      className="surface-raised px-6 py-8 md:px-8 md:py-11"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="min-w-0 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-portal-accent">
            Now
          </p>
          <h2
            id="portal-now-heading"
            className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight text-black md:text-5xl lg:text-[3.25rem]"
          >
            {current.label}
          </h2>
          <p className="mt-4 max-w-prose font-serif text-lg italic leading-snug text-neutral-500 md:text-xl">
            {current.description}
          </p>
        </div>

        <div className="w-full shrink-0 md:max-w-[14rem]">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            Progress
          </p>
          <p className="mt-2 font-serif text-4xl tracking-tight text-black tabular-nums md:text-5xl">
            {percent}
            <span className="text-2xl text-neutral-400 md:text-3xl">%</span>
          </p>
          <div
            className="progress-track mt-4"
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
          <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400">
            Overall project
          </p>
        </div>
      </div>
    </section>
  );
}
