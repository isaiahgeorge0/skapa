const columns = [
  {
    name: "Incoming",
    cards: [
      ["218", "Jerk Burger Meal", "mac n cheese", "£13.00", "Collection"],
      ["219", "2 Meat Box", "rice n peas", "£15.00", "Delivery"],
    ],
  },
  {
    name: "On the grill",
    cards: [
      ["214", "Jerk Chicken & Fries", "festival", "£10.00", "Collection"],
      ["215", "Small Meat Box", "plantain", "£10.00", "Collection"],
    ],
  },
  {
    name: "Ready",
    cards: [["211", "Crispy Strips Meal", "plain fries", "£10.00", "Collection"]],
  },
];

export default function YardKitchenOrders({ display, body }: { display: string; body: string }) {
  return (
    <div className={`${body} flex w-[1040px] bg-[#0D1014] text-[#F1EADF]`}>
      <div className="min-w-0 flex-1 p-6">
        <div className="flex items-center justify-between">
          <p className={`${display} text-4xl uppercase tracking-tight`}>Orders</p>
          <p className="rounded-full bg-[#F0582F] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#0D1014]">
            Grill&apos;s lit
          </p>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {columns.map((column) => (
            <div key={column.name}>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#9C968C]">{column.name}</p>
              <div className="mt-3 space-y-3">
                {column.cards.map(([id, meal, side, price, method]) => (
                  <article key={id} className="rounded-xl bg-[#171A1F] p-4">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#9C968C]">#{id}</p>
                    <p className={`${display} mt-2 text-2xl uppercase leading-none`}>{meal}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.08em] text-[#9C968C]">{side}</p>
                    <p className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.12em]">
                      <span className="text-[#E2B04A]">{price}</span>
                      <span>{method}</span>
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
