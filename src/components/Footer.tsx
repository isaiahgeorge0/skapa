import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-6 py-8 md:px-10">
        <Link href="/" className="font-serif text-sm text-black">
          skapa <span className="italic text-brand-pink">Creative</span>
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
