import Image from "next/image";

const stats = [
  ["Projects", "4", "Harbour Coffee rebrand"],
  ["Tasks", "12", "3 due this week"],
  ["Goals", "2", "Northgate Dental site"],
  ["Leads", "6", "2 waiting on a reply"],
];

export default function WiskOverview({ display, body }: { display: string; body: string }) {
  return (
    <div className={`${body} w-[1040px] bg-[#F7F6F3] px-8 py-6 text-[#141B27]`}>
      <div className="flex items-center justify-between">
        <Image
          src="/images/work/wisk/brand/logo-white.svg"
          alt=""
          width={120}
          height={28}
          unoptimized
          className="h-7 w-auto rounded bg-[#141B27] px-2 py-1"
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-50">Overview</p>
      </div>
      <h3 className={`${display} mt-8 text-4xl`}>
        Good morning, <span className="text-[#4A3DB0]">Alex</span>
      </h3>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {stats.map(([label, value, note]) => (
          <article key={label} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#016C81]">{label}</p>
            <p className={`${display} mt-2 text-4xl`}>{value}</p>
            <p className="mt-2 text-sm opacity-70">{note}</p>
          </article>
        ))}
      </div>
      <article className="mt-4 rounded-2xl border border-[#ACA0FF] bg-white px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#4A3DB0]">Winston · morning briefing</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed">
          Two projects need a look today. Harbour Coffee is waiting on a logo round, and the Northgate Dental
          homepage is ready for a first pass.
        </p>
      </article>
    </div>
  );
}
