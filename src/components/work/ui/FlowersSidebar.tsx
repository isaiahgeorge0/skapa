import Image from "next/image";

const items = ["Dashboard", "Orders", "Menu", "Settings", "Catering leads", "Staff"];

export default function FlowersSidebar({ active }: { active: string }) {
  return (
    <aside className="flex w-52 shrink-0 flex-col bg-[#1E3A30] px-4 py-6 text-[#F3EADB]">
      <Image
        src="/images/work/flowers-kitchen/brand/logo-horizontal-mono-white.svg"
        alt=""
        width={180}
        height={36}
        unoptimized
        className="h-9 w-auto px-1"
      />
      <nav className="mt-8 space-y-1 text-sm">
        {items.map((item) => (
          <p
            key={item}
            className={
              item === active
                ? "rounded-lg bg-[#F3EADB] px-3 py-2 font-medium text-[#1E3A30]"
                : "px-3 py-2 opacity-70"
            }
          >
            {item}
          </p>
        ))}
      </nav>
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">Demo owner</p>
    </aside>
  );
}
