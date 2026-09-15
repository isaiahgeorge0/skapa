export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "p-6 md:p-7",
}: {
  title?: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`surface-raised ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-black/[0.04] px-6 py-4 md:px-7 md:py-5">
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
