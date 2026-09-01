export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "p-6",
}: {
  title?: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.04)] ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            {title && (
              <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                {title}
              </p>
            )}
            {subtitle && (
              <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
