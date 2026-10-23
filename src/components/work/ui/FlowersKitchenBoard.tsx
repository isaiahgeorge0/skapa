import FlowersSidebar from "@/components/work/ui/FlowersSidebar";

type OrderCard = { id: string; line: string; tag?: string; late?: boolean };

const columns: { name: string; cards: OrderCard[] }[] = [
  { name: "New", cards: [{ id: "1048", line: "1 Meat Box · festival · just in" }] },
  {
    name: "Preparing",
    cards: [
      { id: "1042", line: "2 Meat Box · rice & peas · 4 min" },
      { id: "1039", line: "Family Box", tag: "Start now" },
    ],
  },
  {
    name: "Ready",
    cards: [
      { id: "1036", line: "Jerk Box · mac & cheese", tag: "Late", late: true },
      { id: "1033", line: "Wrap Box · collection" },
    ],
  },
  { name: "Collected", cards: [{ id: "1028", line: "1 Meat Box · collected" }] },
];

export default function FlowersKitchenBoard({ display, body }: { display: string; body: string }) {
  return (
    <div className={`${body} flex w-[1040px] bg-[#F3EADB] text-[#2B1B16]`}>
      <FlowersSidebar active="Orders" />
      <div className="min-w-0 flex-1 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8F1D2C]">Orders today</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ["In the kitchen", "4", "New, preparing or ready"],
            ["Orders", "11", "Paid online today"],
            ["Takings", "£148", "Paid today, after refunds"],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-2xl bg-[#FBF6EE] px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-60">{label}</p>
              <p className={`${display} mt-2 text-4xl leading-none`}>{value}</p>
              <p className="mt-2 text-xs opacity-60">{note}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3">
          {columns.map((column) => (
            <div key={column.name}>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-60">{column.name}</p>
              <div className="mt-2 space-y-2">
                {column.cards.map((card) => (
                  <div key={card.id} className="rounded-xl bg-[#FBF6EE] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-50">#{card.id}</p>
                    <p className="mt-1 text-sm leading-snug">{card.line}</p>
                    {card.tag ? (
                      <p
                        className="mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white"
                        style={{ background: card.late ? "#8F1D2C" : "#1E3A30" }}
                      >
                        {card.tag}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
