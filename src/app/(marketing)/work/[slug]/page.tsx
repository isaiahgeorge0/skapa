import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { clientFontClass } from "@/app/(marketing)/work/fonts";
import ScaledStage from "@/components/work/ScaledStage";
import BluePeakDashboard from "@/components/work/ui/BluePeakDashboard";
import FlowersCateringLeads from "@/components/work/ui/FlowersCateringLeads";
import FlowersKitchenBoard from "@/components/work/ui/FlowersKitchenBoard";
import WiskOverview from "@/components/work/ui/WiskOverview";
import YardKitchenOrders from "@/components/work/ui/YardKitchenOrders";
import { chipInk } from "@/lib/color";
import { pageMetadata } from "@/lib/seo";
import { caseStudies, visitUrl, type CaseStudy } from "@/lib/work";

type Params = { slug: string };

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((item) => item.slug === slug);
  if (!study) return {};
  return pageMetadata({
    title: study.client,
    description: study.summary,
    path: `/work/${study.slug}`,
  });
}

function headlineClass(headline: string) {
  const measure = "max-w-[84ch]";
  if (headline.length <= 20) return `text-[6rem] md:text-[9rem] ${measure}`;
  if (headline.length <= 40) return `text-[3.5rem] md:text-[6rem] ${measure}`;
  return `text-[2.75rem] md:text-[4.5rem] ${measure}`;
}

function quoteClass(quote: string) {
  const measure = "mx-auto w-full max-w-[132ch]";
  if (quote.length <= 80) return `text-4xl md:text-6xl ${measure}`;
  if (quote.length <= 160) return `text-[1.35rem] md:text-[2.25rem] ${measure}`;
  return `text-[1.0125rem] md:text-[1.6875rem] ${measure}`;
}

function specimenLine(study: CaseStudy) {
  if (study.slug === "flowers-kitchen") {
    return "Recipes taught by our fathers and uncles. Cooked by their sons.";
  }
  if (study.slug === "blue-peak") {
    return "We visit, measure up, and send a clear price before any work is booked.";
  }
  if (study.brand.taglines[1]) return study.brand.taglines[1];
  return study.brand.taglines[0] ?? "";
}

function heroLogo(study: CaseStudy) {
  if (study.slug === "blue-peak") return study.brand.logos.primary;
  const bg = study.theme.bg.replace("#", "");
  const r = Number.parseInt(bg.slice(0, 2), 16);
  const g = Number.parseInt(bg.slice(2, 4), 16);
  const b = Number.parseInt(bg.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.45 ? study.brand.logos.onDark : study.brand.logos.primary;
}

const liveCopy: Record<string, string> = {
  "blue-peak": "Brand and guidelines",
};

const comingSoon: Record<string, string> = {
  "flowers-kitchen": "Online ordering",
  "yard-kitchen": "Online ordering",
  "blue-peak": "Website and back office",
};

function neighbours(study: CaseStudy) {
  const index = caseStudies.findIndex((item) => item.slug === study.slug);
  const count = caseStudies.length;
  return {
    previous: caseStudies[(index - 1 + count) % count],
    next: caseStudies[(index + 1) % count],
  };
}

function hostOf(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function BrowserFrame({
  study,
  children,
  raised = false,
}: {
  study: CaseStudy;
  children: ReactNode;
  raised?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl ${raised ? "border border-[#3A3F46]" : "shadow-[0_24px_60px_rgba(0,0,0,0.18)]"}`}
      style={{ backgroundColor: raised ? "#171A1F" : study.theme.bg }}
    >
      <div className="flex items-center gap-1.5 px-4 py-3" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full opacity-30" style={{ backgroundColor: study.theme.fg }} />
        <span className="h-2.5 w-2.5 rounded-full opacity-30" style={{ backgroundColor: study.theme.fg }} />
        <span className="h-2.5 w-2.5 rounded-full opacity-30" style={{ backgroundColor: study.theme.fg }} />
      </div>
      {children}
    </div>
  );
}

function screenFor(name: CaseStudy["screens"][number], display: string, body: string) {
  if (name === "flowers-board") return <FlowersKitchenBoard display={display} body={body} />;
  if (name === "flowers-catering") return <FlowersCateringLeads display={display} body={body} />;
  if (name === "blue-dashboard") return <BluePeakDashboard display={display} body={body} />;
  if (name === "yard-orders") return <YardKitchenOrders display={display} body={body} />;
  return <WiskOverview display={display} body={body} />;
}


export default async function ClientWorkPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const study = caseStudies.find((item) => item.slug === slug);
  if (!study) notFound();

  const fonts = clientFontClass[study.slug];
  const skapaPage = study.slug === "wisk";
  const display = skapaPage ? "font-display" : fonts?.display ?? "font-display";
  const body = skapaPage ? "font-display" : fonts?.body ?? "font-display";
  const specimenDisplay = fonts?.display ?? display;
  const specimenBody = fonts?.body ?? body;
  const voiceOn = study.voice?.approved === true;
  const quoteOn = study.testimonial?.approved === true;
  const link = visitUrl(study);
  const chipText = chipInk(study.theme.accent, study.theme.bg);
  const { previous, next } = neighbours(study);
  const headline = voiceOn && study.voice ? study.voice.headline : study.client;
  const liveLabel = liveCopy[study.slug] ?? (link ? hostOf(link) : study.status.live[0]);
  const soonLabel = comingSoon[study.slug];
  const captures = study.extraCaptures.filter((item) => item.src);
  const photoGrid = (
    <section className="site-container py-16 md:py-24">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {study.photos.map((photo) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={1600}
            height={2000}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="mb-4 h-auto w-full break-inside-avoid"
          />
        ))}
      </div>
    </section>
  );

  return (
    <article style={{ backgroundColor: study.theme.bg, color: study.theme.fg }} className={`${body} overflow-x-hidden`}>
      <section className="site-container flex min-h-[70vh] items-center py-10 md:py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] opacity-70">
              skapa ×
              <Image
                src={study.brand.logos.mark}
                alt=""
                width={48}
                height={48}
                unoptimized
                className={`h-6 w-auto ${skapaPage ? "rounded bg-[#141B27] px-1 py-0.5" : ""}`}
              />
            </p>
            <h1 className={`${display} ${headlineClass(headline)} mt-5 font-semibold leading-[0.9] tracking-tight`}>
              {headline}
            </h1>
          </div>
          {study.captureReady ? (
            <div className="hidden justify-center lg:flex">
              <div className="w-[min(100%,260px)]">
                <div className="rounded-[1.7rem] border-[7px] border-neutral-900 bg-neutral-900 shadow-xl">
                  <div className="relative aspect-[390/844] overflow-hidden rounded-[1.15rem]">
                    <Image
                      src={study.images.mobile}
                      alt=""
                      fill
                      priority
                      className="object-cover object-top"
                      sizes="260px"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden items-center justify-center lg:flex">
              <Image
                src={heroLogo(study)}
                alt=""
                width={640}
                height={480}
                unoptimized
                priority
                className="h-auto max-h-[46vh] w-auto max-w-full"
              />
            </div>
          )}
        </div>
      </section>

      <section className="site-container grid items-start gap-10 pb-12 md:grid-cols-2 md:gap-16 md:pb-16">
        <p className="text-2xl leading-snug md:text-4xl">
          {voiceOn && study.voice ? study.voice.intro : study.summary}
        </p>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em]">{study.sector}</p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em]">{study.location}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {study.services.map((service) => (
              <li
                key={service}
                className="rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em]"
                style={{ backgroundColor: study.theme.accent, color: chipText }}
              >
                {service}
              </li>
            ))}
          </ul>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block font-mono text-xs uppercase tracking-[0.16em] underline-offset-4 hover:underline"
              style={{ color: study.theme.accent }}
            >
              Visit site ↗
            </a>
          ) : (
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] opacity-70">Launching soon</p>
          )}
        </div>
      </section>

      <section className="site-container pb-14 md:pb-20">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 font-mono text-xs">
          <p className="flex items-center gap-2">
            <span aria-hidden="true">●</span>
            <span>Live · {liveLabel}</span>
          </p>
          {soonLabel ? (
            <p className="flex items-center gap-2 opacity-80">
              <span aria-hidden="true">○</span>
              <span>Coming soon · {soonLabel}</span>
            </p>
          ) : null}
        </div>
      </section>

      <section className="site-container py-8 md:py-12">
        <h2 className={`${display} text-4xl font-semibold tracking-tight md:text-6xl`}>The brand</h2>
        {study.brand.logoIsOurs ? null : (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">Their logo. Our system around it.</p>
        )}
        <div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr_0.6fr]">
          <div className="flex min-h-48 items-center justify-center rounded-2xl p-8" style={{ backgroundColor: skapaPage ? study.brand.logoTile : study.theme.bg }}>
            <Image src={study.brand.logos.primary} alt={`${study.client} logo`} width={480} height={240} unoptimized className="h-auto max-h-40 w-auto max-w-full" />
          </div>
          <div className="flex min-h-48 items-center justify-center rounded-2xl p-8" style={{ backgroundColor: study.brand.logoTile }}>
            <Image src={study.brand.logos.onDark} alt="" width={480} height={240} unoptimized className="h-auto max-h-40 w-auto max-w-full" />
          </div>
          <div className="flex min-h-36 items-center justify-center rounded-2xl p-6" style={{ backgroundColor: skapaPage ? study.brand.logoTile : study.theme.bg }}>
            <Image src={study.brand.logos.mark} alt="" width={128} height={128} unoptimized className="h-16 w-auto" />
          </div>
        </div>

        <div className="mt-8 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6">
          {study.brand.palette.map((swatch) => (
            <div key={swatch.hex} className="w-36 shrink-0 md:w-auto">
              <div className="h-28 rounded-2xl ring-1 ring-inset ring-current/25" style={{ backgroundColor: swatch.hex }} />
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em]">{swatch.name}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">{swatch.hex}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] opacity-60">{swatch.role}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <p className={`${specimenDisplay} text-7xl leading-none md:text-8xl`}>Aa</p>
            <p className={`${fonts?.accent ? `${fonts.accent} italic` : specimenDisplay} mt-4 text-2xl`}>
              {study.brand.taglines[0]}
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">{study.brand.fonts.display}</p>
          </div>
          <div>
            <p className={`${specimenBody} max-w-md text-lg leading-relaxed`}>{specimenLine(study)}</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">{study.brand.fonts.body}</p>
          </div>
        </div>

        {study.brand.guidelines?.length ? (
          <div className="mt-10 overflow-x-auto pb-2">
            <div className="flex w-max gap-4">
              {study.brand.guidelines.map((page) => (
                <Image
                  key={page.src}
                  src={page.src}
                  alt={page.alt}
                  width={1600}
                  height={1000}
                  sizes="280px"
                  loading="eager"
                  className="h-56 w-auto rounded-xl md:h-72"
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {study.captureReady || captures.length ? (
        <section
          className="px-[clamp(1.5rem,4vw,5rem)] py-12 md:py-16"
          style={{ backgroundColor: `color-mix(in srgb, ${study.theme.bg} 78%, ${study.theme.fg})` }}
        >
          <h2 className={`${display} mb-8 text-4xl font-semibold tracking-tight md:text-6xl`}>The website</h2>
          {study.captureReady ? (
            <div className="relative mx-auto max-w-5xl pb-16 md:pb-24">
              <BrowserFrame study={study}>
                <div className="relative aspect-[16/10]">
                  <Image src={study.images.desktop} alt={study.images.alt} fill className="object-cover object-top" sizes="(min-width: 768px) 64rem, 100vw" />
                </div>
              </BrowserFrame>
              <div className="absolute bottom-0 right-4 w-[34%] max-w-[220px] md:right-10 md:w-[24%]">
                <div className="rounded-[1.7rem] border-[7px] border-neutral-900 bg-neutral-900 shadow-xl">
                  <div className="relative aspect-[390/844] overflow-hidden rounded-[1.15rem]">
                    <Image src={study.images.mobile} alt="" fill className="object-cover object-top" sizes="220px" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {captures.length ? (
            <div className={`mx-auto grid max-w-5xl gap-6 md:grid-cols-2 ${study.captureReady ? "mt-8" : ""}`}>
              {captures.map((item) => (
                <div key={item.route}>
                  <BrowserFrame study={study}>
                    <div className="relative aspect-[16/10]">
                      <Image src={item.src!} alt={item.label} fill className="object-cover object-top" sizes="(min-width: 768px) 40vw, 100vw" />
                    </div>
                  </BrowserFrame>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">{item.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {study.band ? (
        <div className="relative h-[60vh] max-h-[60vh] w-full">
          <Image src={study.band.src} alt={study.band.alt} fill className="object-cover object-center" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          <p
            className={`${display} absolute bottom-8 left-[clamp(1.5rem,4vw,5rem)] text-4xl font-semibold leading-none tracking-tight text-[#F1EADF] md:text-6xl`}
          >
            <span className="block">Big flavour.</span>
            <span className="block">Yard style.</span>
          </p>
        </div>
      ) : null}

      <section className="site-container py-16 md:py-24">
        <h2 className={`${display} text-4xl font-semibold tracking-tight md:text-6xl`}>{study.backstageTitle}</h2>
        <div className="mt-8 space-y-8">
          {study.screens.map((name) => {
            return (
              <div key={name}>
                <BrowserFrame study={study} raised={name === "yard-orders"}>
                  <ScaledStage width={1040}>
                    {screenFor(name, skapaPage ? "font-sans" : display, skapaPage ? "font-sans" : body)}
                  </ScaledStage>
                </BrowserFrame>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">Recreated with demo data</p>
              </div>
            );
          })}
        </div>
      </section>

      {study.slug === "yard-kitchen" && study.photos.length ? photoGrid : null}

      <section className="site-container pb-16 md:pb-24">
        <h2 className={`${display} text-4xl font-semibold tracking-tight md:text-6xl`}>What we built</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {(
            [
              ["Brand", study.scope.brand],
              ["Website", study.scope.website],
              ["Behind the scenes", study.scope.behindTheScenes],
            ] as const
          )
            .filter(([, items]) => items.length)
            .map(([title, items]) => (
              <div key={title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-60">{title}</p>
                <ul className="mt-4 space-y-5">
                  {items.map((item) => (
                    <li key={item.title}>
                      <p className={`${display} text-2xl font-semibold leading-tight`}>{item.title}</p>
                      <p className="mt-1 leading-relaxed opacity-80">{item.line}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {study.scope.stack.map((item) => (
            <li key={item} className="rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: study.theme.accent }}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {quoteOn && study.testimonial ? (
        <section className="site-container py-16 text-center md:py-28">
          <blockquote>
            <p className={`${display} font-semibold leading-tight tracking-tight ${quoteClass(study.testimonial.quote)}`} style={{ color: study.theme.accent }}>
              {study.testimonial.quote}
            </p>
            <footer className="mt-8 font-mono text-xs uppercase tracking-[0.16em] opacity-70">
              {study.testimonial.name}
              <span className="mx-2">·</span>
              {study.testimonial.role}
            </footer>
          </blockquote>
        </section>
      ) : null}

      {voiceOn && study.voice ? (
        <section className="site-container grid gap-8 py-8 md:grid-cols-2 md:gap-16 md:py-12">
          {study.voice.story.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed md:text-xl">
              {paragraph}
            </p>
          ))}
        </section>
      ) : null}

      {study.slug !== "yard-kitchen" && study.photos.length ? photoGrid : null}

      <nav className="grid grid-cols-2" aria-label="More work">
        {[
          { study: previous, label: "Previous" },
          { study: next, label: "Next" },
        ].map((item) => {
          const itemFont = clientFontClass[item.study.slug];
          const itemDisplay = item.study.slug === "wisk" ? "font-display" : itemFont?.display ?? "font-display";
          return (
            <Link
              key={item.label}
              href={`/work/${item.study.slug}`}
              className="flex min-h-40 flex-col justify-between px-6 py-8 md:min-h-52 md:px-10 md:py-10"
              style={{ backgroundColor: item.study.theme.bg, color: item.study.theme.fg }}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</span>
              <span className={`${itemDisplay} text-2xl font-semibold tracking-tight md:text-4xl`}>{item.study.client}</span>
            </Link>
          );
        })}
      </nav>
    </article>
  );
}
