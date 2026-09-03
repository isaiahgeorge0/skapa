# Skapa Capability Page Playbook

Working reference derived from the finished implementations of:

- `/what-we-do/brand/brand-strategy`
- `/what-we-do/brand/brand-identity`

Use this when building the next capability page (e.g. Rebranding). Preserve siblings, not clones.

---

## 1. Core Philosophy

**Simple at first glance. Creative when you interact with it.**

- First viewport: one composition, one idea, one CTA group. Not a dashboard.
- Brand first: hero must still feel like skapa if the nav were removed.
- Motion is purposeful storytelling, not decoration.
- Each service gets its own visual narrative. Shared rules; different metaphor.
- Permanent content rule: **zero em dash characters** (`—`) in user-facing copy.

Brand Strategy and Brand Identity should feel like siblings:

| Shared | Distinct |
|---|---|
| Typography, palette, CTA language, chapter chrome, SEO shape, motion quality | Metaphor, chapter count, scroll scenes, imagery, interaction models |

---

## 2. Visual Language

### Shared

- Page shell: `bg-bs-offwhite text-black` on the page root.
- Content column: `mx-auto max-w-6xl px-6 md:px-10 lg:pr-24`
  - `lg:pr-24` clears the desktop chapter rail.
- Mid-chapter separators: `border-t border-black/5`.
- Section vertical rhythm: typically `py-20 md:py-28` (final CTA often `py-24 md:py-32`).
- Atmosphere over flat white: colour planes, grids, construction marks, hard colour fields. Decorative gradients alone are not the main visual idea.

### Page-specific (do not clone)

| Page | Metaphor |
|---|---|
| Brand Strategy | Questions, clarity, decisions, structure, abstract diagrams, flip-deck artefacts |
| Brand Identity | Construction, form lock, voice exploration, colour arrival, system ingredients, applications |

---

## 3. Typography

### Families

Set in `src/app/layout.tsx` + `globals.css`:

- Display / headlines: `font-serif` → Newsreader
- Labels / body / UI: `font-mono` → IBM Plex Mono

### Patterns (both pages)

| Role | Typical classes |
|---|---|
| Eyebrow / chapter label | `font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500` |
| Micro nav / badges | `font-mono text-[10px]` with tracking `0.14em`–`0.18em` |
| Body | `font-mono text-sm leading-relaxed` → `md:text-base` |
| H1 hero | Serif, mobile ~`2.15rem`–`2.4rem`, desktop `md:text-6xl` / `lg:text-[4rem]`–`4.1rem` |
| H2 section | Often `text-3xl md:text-5xl` (final CTA can be larger) |

Do not shrink headlines to “fix” mobile spacing. Fix inset/clearance instead.

---

## 4. Colour

### Tokens (`src/app/globals.css`)

| Token | Hex | Use |
|---|---|---|
| `bs-purple` / `--brand-blue` | `#4b4ae4` | Fields, accents, primary wipe |
| `bs-pink` / `--brand-pink` | `#ff2791` | Fields, accents, on-colour wipe |
| `bs-yellow` / `--brand-yellow` | `#fff1a7` | Fields, accents |
| `bs-offwhite` / `--brand-cream` | `#efeeea` | Page / sticky stage grounds |

Chapter nav accents live in each page’s `chapters.ts` and may use palette or greys (Identity early chapters use `#737373` / `#111111`).

### Contrast rule (from Identity Ch04)

When colour fields move under type:

- Purple → light / off-white text
- Pale yellow → dark text
- Off-white → dark text
- Pink → pick dark or light from actual contrast

Do not rely on text shadows or translucent boxes. Prefer geometry + timed colour flips so copy stays over a compatible field for the whole scroll sequence.

---

## 5. Layout & Spacing

### Shared content grid

```
VIEWPORT EDGE
→ gutter (mobile hero often px-8, not px-6)
→ editorial content
→ gutter
→ VIEWPORT EDGE
```

Graphics may bleed past the content grid. Copy and CTAs must not.

### Chrome clearance (`globals.css`)

```css
--skapa-site-chrome-height: 5rem;
--skapa-chapter-pill-clearance: 4rem;
```

| Utility | Purpose |
|---|---|
| `scroll-mt-chapter` | Anchor land below chrome + pill (`9rem`); use `lg:scroll-mt-0` when the desktop rail replaces the pill |
| `pt-chapter-safe` | Sticky / intro content starts below chrome + pill |

### Critical absolute-layer rule

**Parent `padding` does not inset `absolute inset-0` stages.** Put horizontal and top clearance on the stage itself.

Evidence:

- Strategy Clarity: `px-8` + `pt-[max(7.75rem,calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+0.75rem))]` on `StageCopy`
- Identity Idea: `MOBILE_STAGE_TOP` (+ `1.75rem`) and `px-8 sm:px-10` on `Stage`

---

## 6. Navigation

### Marketing header

Shared site chrome. Capability pages must reserve `--skapa-site-chrome-height`.

### Chapter navigation

Near-clones (do not force a shared abstraction yet):

- Strategy: `src/components/brand-strategy/ChapterNav.tsx`
- Identity: `src/components/brand-identity/IdentityChapterNav.tsx`

| Surface | Behaviour |
|---|---|
| Desktop (`lg+`) | Fixed right rail, `z-40`, expands on hover, accent progress line |
| Mobile | Fixed centred pill under chrome (`top: chrome + 0.35rem`–`0.5rem`), drawer `z-50` |
| Active chapter | `IntersectionObserver` `rootMargin: "-20% 0px -45% 0px"`, thresholds `[0.1, 0.25, 0.5]` |
| Jump | `scrollIntoView({ block: "start" })`; `auto` when reduced motion |

Treat the pill as reserved interface space in every mobile sticky composition:

```
SITE HEADER
↓
CHAPTER PILL ZONE
↓
ACTIVE SCENE
```

---

## 7. Motion Language

### Shared quality bar

- Prefer scroll-linked storytelling (`motion` / `useScroll` / `useTransform`) over autoplay loops.
- Exclusive stages: one dominant message at a time.
- Opacity gates: hide layers when opacity `< ~0.04` (`invisible` + `pointer-events-none` + `aria-hidden`). Strategy Clarity also disables pointer events below `0.5`.
- Sticky stages: `sticky top-0` + `h-[100svh]` + `overflow-hidden` + opaque background (`isolate` when stacking chapters).
- Section handoffs: higher `z-index` + opaque sticky + short release spacer so the next chapter does not bleed through.
- Easing: calm; most scroll maps are linear progress windows, not bouncey spring spam.

### Reusable local patterns

| Pattern | Where it appears |
|---|---|
| Exclusive absolute stages | Strategy Clarity `StageCopy`; Identity Idea `Stage` |
| Colour-field CTA parallax | Strategy `ChapterStart`; Identity `ChapterImagine` |
| FAQ colour-on-expand | Strategy `ChapterForYou`; Identity `ChapterImagine` |
| `useReducedMotion` | Duplicated per page folder (identical hook) |

### Do not blindly copy these scenes

| Page | Unique motion (art direction) |
|---|---|
| Strategy | Purple colour curtain parallax; Q1–Q3 exclusive questions; Familiar quote reveals; Strategy tab theatre; Useful flip-deck + creative crossfade |
| Identity | Sketchbook resolve; Form reject/construct/lock; Voice strike-through sheet; Personality colour planes; System traveling panels; measured horizontal applications |

Future pages invent their own metaphor. Borrow **mechanics** (sticky track, exclusive stages, reduced-motion trees), not Strategy’s questions or Identity’s logo construction.

---

## 8. Scroll Choreography

### Track length rule

Sticky animation tracks must have scroll distance proportional to the number of meaningful visual states.

Pattern:

```
ESTABLISH → ANIMATE → RESOLVE → BRIEF HOLD → NEXT CHAPTER
```

Avoid:

- Long pinned empty off-white after the final state
- Dead scroll after commercial copy has fully established
- Tracks so short that states are skipped

Examples from finished code:

- Identity Ch01: track `230vh`; premise clear ends near `0.97`; mobile release spacer `6vh` (`md:h-0`)
- Identity Ch02: mobile track `200vh` (desktop `250vh`); commercial establishes then brief hold
- Strategy Useful: mobile track **longer** (`265vh`) than desktop (`190vh`) so cards get presence

### One-way visibility while scrolling down

Each piece of copy should have **one** enter → hold → exit lifecycle while scrolling down. Reversible on scroll up is correct. Mid-sequence reappearance is a mapping bug.

Identity Ch02 lesson: heading opacity descends once to `0` and stays there; construction and commercial use separate zones.

### Desktop / mobile

When a composition cannot fit a short mobile viewport, prefer **phased ownership** over shrinking everything:

1. Heading moment
2. Visual moment
3. Commercial / resolve moment

Identity Form is the reference. Strategy Useful uses a longer mobile track instead of forcing desktop card timing into a short phone.

### Progress measurement caveats

For some sticky / measured layouts, Framer `useScroll` alone was unreliable. Identity System/Recognisable use window-scroll progress helpers and (Ch06) `ResizeObserver` to size the track from real overflow.

If a horizontal or multi-panel sequence clips or ends early: measure content, don’t guess `%` travel.

---

## 9. Mobile Rules

Concrete checks derived from finished fixes:

1. **Hero horizontal inset:** Editorial stages use at least `px-8` (Strategy Clarity / Identity Idea), not flush `px-0`. Prefer Strategy’s `px-8 sm:px-10` language on hero stages.
2. **Absolute stages carry their own top clearance** (chrome + pill + breathing room). Never assume parent `pt-chapter-safe` moves absolute children.
3. **Pill must not sit on the headline.** Composition starts below pill zone.
4. **Sticky backgrounds are opaque** so adjacent chapters cannot show through mid-handoff.
5. **Release spacers** after sticky stories when needed so the next sticky does not steal the frame early (Identity Ch01).
6. **No all-faint frames:** during handoffs, keep one dominant element (avoid every major layer at 10–30% opacity).
7. **Colour contrast across the whole sequence**, not just the resting frame.
8. **Horizontal strips:** measure overflow; give the track enough `vh` for every card + finale.
9. **Desktop-approved layouts:** if mobile needs different choreography, split with `md:hidden` / `hidden md:block` rather than warping the approved desktop composition.
10. **Do not redesign desktop** to solve mobile.

---

## 10. Responsive QA

Test capability pages at least at:

| Width | Height examples |
|---|---|
| 375 | 667, 812 |
| 400 | 770 |
| 430 | 932 |
| Desktop | ~1280–1440 |

For every sticky chapter, scrub:

`ENTER → ESTABLISHED → TRANSITION → RESOLVED → EXIT`

and scroll backwards once.

Checklist per state:

- [ ] No clipping under header / pill
- [ ] No accidental chapter overlap
- [ ] No half-visible commercial line unless intentionally entering
- [ ] No blank sticky after story completed
- [ ] Reduced motion still readable (static alternate)

---

## 11. Reusable Components

### Safe to reuse as a pattern (copy / lightly adapt)

| Item | Notes |
|---|---|
| `pageMetadata` + JSON-LD graph shape | Required architecture |
| `scroll-mt-chapter` / `pt-chapter-safe` | Global utilities |
| Chapter `chapters.ts` shape | `{ id, number, label, short, accent }` |
| CTA button interaction | Left wipe / arrow expand; variants `primary` \| `secondary` \| `on-colour` |
| Exclusive Stage opacity gate | Hide below ~0.04 |
| `useReducedMotion` behaviour | Static fallbacks required |
| FAQ expand + colour field | Interaction model only |

### Reuse as foundation / variant

| Item | Guidance |
|---|---|
| ChapterNav / IdentityChapterNav | Near-clones today. Prefer copy-and-adjust until a third page proves a shared API. |
| BrandStrategyButton / IdentityButton | Same language, duplicated on purpose. A shared `CapabilityButton` is optional later. |
| Final CTA colour-field parallax | Reuse mechanics; restage art direction. |

### Page-specific — do not reuse blindly

| Item | Why |
|---|---|
| Clarity colour curtain + question stages | Strategy metaphor |
| Familiar quote rows | Strategy metaphor |
| Strategy interactive matrix / tabs | Strategy metaphor |
| Useful flip-deck slide faces | Strategy artefacts |
| Idea sketch field | Identity metaphor |
| Form MarkStages construction | Identity metaphor |
| Voice strike-through sheet | Identity metaphor |
| Personality colour choreography | Identity metaphor |
| System TravelPanel stack | Identity metaphor |
| Recognisable application strip content | Identity applications |

**Do not abstract early.** Premature shared wrappers make art direction harder. Duplicate small utilities until three pages share identical needs.

---

## 12. Page-Specific Art Direction

When starting a new capability page, decide first:

1. **Service metaphor** (one sentence)
2. **Chapter spine** (6–8 steps max; each chapter one job)
3. **Which 2–3 scenes earn custom motion**
4. **What stays quiet** (supporting chapters can be simpler)

Examples of good metaphor briefs:

- Strategy: “Better questions before better design.”
- Identity: “Loose decisions become a recognisable system.”
- Rebranding: invent its own (e.g. transition, before/after, continuity) — do not paste Identity’s construction diagram.

---

## 13. SEO Requirements

### Helper

`src/lib/seo.ts` → `pageMetadata({ title, description, path })`

Inherits automatically:

- Canonical: `https://skapa.uk{path}`
- Open Graph title / description / url / siteName / locale / type
- Twitter `summary_large_image` + title / description
- **OG + Twitter image:** `OG_IMAGE_PATH = "/og.jpg"` → absolute `https://skapa.uk/og.jpg` via root `metadataBase`

Future capability pages only need a correct `pageMetadata(...)` call. Do not invent a second metadata system.

### Page-level additions (both finished pages)

- Inline JSON-LD `@graph`:
  - `BreadcrumbList`: Home → What We Do → {Service}
  - `Service`: name, description, url, `serviceType`, `areaServed`, `provider` → `/#organization`
- Sitemap entry in `src/app/sitemap.ts`
- Internal link from `/what-we-do`
- Semantic structure: one `h1`, chapter `h2`s, crawlable body (plus `sr-only` where motion hides copy)
- Permanent: no em dashes in descriptions or on-page copy

---

## 14. Accessibility / Reduced Motion

- Every scroll-heavy chapter needs a **static reduced-motion tree** (or equivalent non-sticky layout) when `prefers-reduced-motion: reduce`.
- Hook pattern: `matchMedia("(prefers-reduced-motion: reduce)")` → `{ reducedMotion, ready }` (currently duplicated under each capability folder).
- Animated exclusive stages should set `aria-hidden` when invisible.
- Prefer real headings and text in the document; do not put the only copy inside canvases.
- Chapter drawer: Escape + outside click to close; `aria-expanded` / `aria-controls` on the pill.

---

## 15. Common Failure Modes

| Failure | Root cause | Finished fix |
|---|---|---|
| Hero text flush to viewport edge | Absolute stages ignore parent `px-*` | Put `px-8+` on the stage |
| Pill overlaps headline | Clearance applied to wrong element / too small | Chrome + pill + breathing room on stage; treat pill as reserved band |
| Ch02 construction under Ch01 copy | Sticky overlap + transparent stage / early start | Opaque sticky, `isolate`, z-index, release spacer, clear exit |
| Heading reappears mid-scroll | Overlapping opacity windows / shared layers | One descending opacity window; hide gate at ~0 |
| Logo sits on commercial line | Absolute zones overlap in short viewport | Phase ownership; retreat/scale visual before copy |
| Washed-out frame | All layers mid-opacity | Keep one dominant element |
| Excess empty sticky scroll | Track longer than final state | End clears near progress ~1; shorten track; brief hold only |
| Light text on yellow | Single foreground colour across moving fields | Geometry + delayed colour flip; protect copy zone |
| Horizontal sequence ends early | `%` travel / unmeasured overflow | Measure strip; dynamic track height |
| Desktop broken by mobile fix | Shared layout mutated | Split mobile/desktop trees when needed |
| Social preview has no image | `OG_IMAGE_PATH` unset | Global `/og.jpg` via `pageMetadata` |

---

## 16. Pre-Launch Checklist

### Structure

- [ ] Route under `src/app/(marketing)/what-we-do/...`
- [ ] Chapter components + local `chapters.ts` + nav
- [ ] Sitemap + `/what-we-do` link
- [ ] `pageMetadata` + BreadcrumbList + Service JSON-LD
- [ ] Zero em dashes in user-facing copy

### Visual / motion

- [ ] First viewport passes the brand test
- [ ] Desktop composition approved before mobile micro-polish wars
- [ ] Sticky tracks match state count; no long empty hold
- [ ] Chapter handoffs: transition, not overlap
- [ ] Reduced-motion static path for every animated chapter

### Mobile

- [ ] 375 / 400 / 430 scrubbed enter→exit→reverse
- [ ] Hero inset ≥ Strategy/Identity stage padding
- [ ] Pill + header clearance verified on absolute stages
- [ ] Contrast holds across animated colour (if any)
- [ ] No content clipped under chrome

### QA

- [ ] Production build passes
- [ ] Desktop unchanged after mobile fixes
- [ ] OG/Twitter image resolves (`/og.jpg`)
- [ ] No new cookie banner unless a non-cookieless tracker is introduced

---

## Appendix A — File map

### Brand Strategy

- Page: `src/app/(marketing)/what-we-do/brand/brand-strategy/page.tsx`
- Components: `src/components/brand-strategy/*`
- Chapters: Clarity → Familiar → Strategy → Useful → ForYou → Start

### Brand Identity

- Page: `src/app/(marketing)/what-we-do/brand/brand-identity/page.tsx`
- Components: `src/components/brand-identity/*`
- Chapters: Idea → Form → Voice → Personality → System → Recognisable → Imagine

### Shared globals / SEO

- `src/app/globals.css` — palette, chrome vars, chapter utilities
- `src/lib/seo.ts` — `pageMetadata`, `OG_IMAGE_PATH`
- `public/og.jpg` — 1200×630 social image
- `src/app/sitemap.ts`

---

## Appendix B — Inconsistencies worth knowing (not auto-bugs)

| Topic | Strategy | Identity | Reading |
|---|---|---|---|
| Chapter count | 6 | 7 | **A** page-specific |
| Hero top clearance | `max(7.75rem, chrome+pill+0.75rem)` | `chrome+pill+1.75rem` | **A/B** both valid; keep ≥ chrome+pill+breathing |
| Pill offset under chrome | `+0.5rem` | `+0.35rem` | **C** minor; either fine |
| `pt-chapter-safe` usage | Rare (Clarity bespoke) | Common on sticky stages | **B** Identity needs more sticky stages |
| Button / nav / reduced-motion files | Duplicated per folder | Duplicated per folder | **A** intentional until third page |
| Stage pointer-events threshold | Clarity also gates at `0.5` | Mostly `0.04` hide only | **A** Strategy needs mid-fade interaction lock |
| Final chapter naming | Start | Imagine | **A** art direction |

Do not “harmonise” these unless a third page proves a shared API is cheaper than duplication.
