import Link from "next/link";
import SkapaWordmarkStack from "@/components/SkapaWordmarkStack";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-brand-blue">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-10 md:py-14">
          <SkapaWordmarkStack size="lg" />
          <div className="md:text-right">
            <Link
              href="/"
              className="font-serif text-sm text-brand-cream transition-opacity hover:opacity-80"
            >
              skapa <span className="italic text-brand-pink">Creative</span>
            </Link>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-cream/70">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
