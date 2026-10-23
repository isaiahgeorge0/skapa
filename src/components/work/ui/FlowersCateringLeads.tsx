import FlowersSidebar from "@/components/work/ui/FlowersSidebar";

const columns = [
  { name: "New", cards: ["Christening · 60 guests · 14 Dec", "Family lunch · 12 guests · 28 Nov"] },
  { name: "Contacted", cards: ["Office lunch · 24 guests · 3 Nov"] },
  { name: "Quoted", cards: ["Birthday · 40 guests · 22 Nov"] },
  { name: "Booked", cards: ["Wedding · 80 guests · 6 Jun"] },
];

const more = ["Anniversary · 45 guests · 11 Apr", "Office party · 70 guests · 12 Dec", "School fair · 120 guests · 18 May"];

export default function FlowersCateringLeads({ display, body }: { display: string; body: string }) {
  return (
    <div className={`${body} flex w-[1040px] bg-[#F3EADB] text-[#2B1B16]`}>
      <FlowersSidebar active="Catering leads" />
      <div className="min-w-0 flex-1 p-6">
        <h3 className={`${display} text-3xl`}>Pipeline</h3>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ["New", "2"],
            ["Quoted", "1"],
            ["Booked", "1"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#FBF6EE] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8F1D2C]">{label}</p>
              <p className={`${display} mt-1 text-2xl leading-none`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {columns.map((column) => (
            <div key={column.name}>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8F1D2C]">{column.name}</p>
              <div className="mt-2 space-y-2">
                {column.cards.map((card) => (
                  <div key={card} className="rounded-xl bg-[#FBF6EE] p-3 text-sm leading-snug">
                    {card}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {more.map((card) => (
            <div key={card} className="rounded-xl bg-[#FBF6EE] p-3 text-sm leading-snug">
              {card}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
