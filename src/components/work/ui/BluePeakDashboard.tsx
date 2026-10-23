import Image from "next/image";

export default function BluePeakDashboard({ display, body }: { display: string; body: string }) {
  const leads = [
    ["BP-0014", "J. Carter", "Kitchen renovation", "2h ago"],
    ["BP-0013", "A. Singh", "Loft conversion", "5h ago"],
  ];

  return (
    <div className={`${body} flex w-[1040px] bg-[#09162A] text-white`}>
      <aside className="flex w-52 shrink-0 flex-col border-r border-[#1A3E75] bg-[#0E2240] px-4 py-5">
        <div className="flex items-center gap-2">
          <Image src="/images/work/blue-peak/brand/mark-white.svg" alt="" width={28} height={28} unoptimized className="h-7 w-auto" />
          <span className={`${display} text-lg`}>Blue Peak</span>
        </div>
        <nav className="mt-8 space-y-3 text-sm">
          {["Dashboard", "Leads", "Calendar", "Follow-ups"].map((item, index) => (
            <p key={item} className={index === 0 ? "rounded-lg bg-[#122C54] px-3 py-2" : "px-3 opacity-70"}>
              {item}
            </p>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#43B7D4]">Thursday</p>
        <h3 className={`${display} mt-2 text-4xl`}>Good afternoon, Kyle</h3>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <section className="rounded-2xl bg-[#0E2240] p-4">
            <h4 className="text-lg">Needs a reply</h4>
            <div className="mt-3 space-y-3">
              {leads.map(([ref, name, job, when]) => (
                <div key={ref} className="flex items-center justify-between gap-3 rounded-xl bg-[#122C54] px-3 py-3">
                  <p className="text-sm">
                    <span className="font-mono text-[11px] text-[#43B7D4]">{ref}</span>
                    <span className="mx-2">·</span>
                    {name}
                    <span className="mx-2">·</span>
                    {job}
                    <span className="mx-2 opacity-50">·</span>
                    <span className="opacity-60">{when}</span>
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#43B7D4]">Call · Email</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl bg-[#0E2240] p-4">
            <h4 className="text-lg">Coming up</h4>
            <div className="mt-4 rounded-xl bg-[#122C54] px-4 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#43B7D4]">Site visit</p>
              <p className="mt-2">Kitchen measure, 4.30pm</p>
              <p className="mt-1 text-sm opacity-60">J. Carter · Ipswich</p>
            </div>
          </section>
        </div>
        <section className="mt-4 rounded-2xl bg-[#0E2240] p-4">
          <h4>Follow-ups</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["Sending today", "2"],
              ["Next 7 days", "5"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#122C54] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#43B7D4]">{label}</p>
                <p className={`${display} mt-1 text-3xl`}>{value}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            ["New", "3"],
            ["Contacted", "2"],
            ["Quoted", "2"],
            ["Won", "1"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#0E2240] px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#43B7D4]">{label}</p>
              <p className={`${display} mt-1 text-2xl`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
