"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

type Answers = {
  name: string;
  email: string;
  brandName: string;
  need: string;
  trigger: string;
  budget: string;
  timeline: string;
  extra: string;
};

const NEED_OPTIONS = [
  "Brand identity",
  "A website",
  "Social & content",
  "Ongoing marketing",
  "Not sure yet",
];
const BUDGET_OPTIONS = ["Under £1k", "£1k to £3k", "£3k to £10k", "£10k+", "Not sure yet"];
const TIMELINE_OPTIONS = ["ASAP", "Within a month", "Just exploring"];

const STEPS = [
  "name",
  "email",
  "brandName",
  "need",
  "trigger",
  "budget",
  "timeline",
  "extra",
  "review",
] as const;
type StepKey = (typeof STEPS)[number];

const EMPTY: Answers = {
  name: "",
  email: "",
  brandName: "",
  need: "",
  trigger: "",
  budget: "",
  timeline: "",
  extra: "",
};

export default function StartQuestionnaire() {
  const [supabase] = useState(() => createClient());
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const step: StepKey = STEPS[stepIndex];

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function next() {
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function canAdvance(): boolean {
    switch (step) {
      case "name":
        return answers.name.trim().length > 0;
      case "email":
        return /\S+@\S+\.\S+/.test(answers.email);
      case "need":
        return answers.need.length > 0;
      case "budget":
        return answers.budget.length > 0;
      case "timeline":
        return answers.timeline.length > 0;
      default:
        return true;
    }
  }

  function handleTextKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && canAdvance()) {
      e.preventDefault();
      next();
    }
  }

  async function submit() {
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("leads").insert({
      name: answers.name,
      email: answers.email,
      message: answers.trigger || null,
      source: "questionnaire",
      answers: {
        brandName: answers.brandName,
        need: answers.need,
        trigger: answers.trigger,
        budget: answers.budget,
        timeline: answers.timeline,
        extra: answers.extra,
      },
    });

    setSubmitting(false);
    if (insertError) {
      console.error("Failed to submit questionnaire:", insertError);
      setError("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  const progress = (stepIndex / (STEPS.length - 1)) * 100;

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-500">
          Thanks, {answers.name.split(" ")[0]}
        </p>
        <h1 className="mb-6 max-w-lg font-serif text-4xl text-black md:text-5xl">
          Got it. <span className="italic text-brand-pink">We'll be in touch.</span>
        </h1>
        <p className="mb-10 max-w-md font-mono text-sm text-neutral-500">
          We read every one of these properly. Expect to hear from us shortly,
          not a canned auto-reply.
        </p>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 underline hover:text-black"
        >
          Back to skapa
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="font-serif text-xl text-black">
          skapa <span className="italic text-brand-pink">Creative</span>
        </Link>
        <p className="font-mono text-xs text-neutral-400">
          {stepIndex + 1} / {STEPS.length}
        </p>
      </div>

      <div className="h-1 w-full bg-neutral-100">
        <div
          className="h-full bg-brand-pink transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16 md:px-10">
        <div className="w-full max-w-xl overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ x: direction > 0 ? 40 : -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -40 : 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {step === "name" && (
                <Question label="What should we call you?">
                  <input
                    autoFocus
                    value={answers.name}
                    onChange={(e) => update("name", e.target.value)}
                    onKeyDown={handleTextKeyDown}
                    placeholder="Your name"
                    className="w-full border-b-2 border-neutral-300 bg-transparent pb-3 font-serif text-2xl text-black outline-none focus:border-brand-pink md:text-3xl"
                  />
                </Question>
              )}

              {step === "email" && (
                <Question label={`Nice to meet you, ${answers.name.split(" ")[0] || "there"}. Best email to reach you?`}>
                  <input
                    autoFocus
                    type="email"
                    value={answers.email}
                    onChange={(e) => update("email", e.target.value)}
                    onKeyDown={handleTextKeyDown}
                    placeholder="you@example.com"
                    className="w-full border-b-2 border-neutral-300 bg-transparent pb-3 font-serif text-2xl text-black outline-none focus:border-brand-pink md:text-3xl"
                  />
                </Question>
              )}

              {step === "brandName" && (
                <Question label="What's your business or brand called?" optional>
                  <input
                    autoFocus
                    value={answers.brandName}
                    onChange={(e) => update("brandName", e.target.value)}
                    onKeyDown={handleTextKeyDown}
                    placeholder="Optional"
                    className="w-full border-b-2 border-neutral-300 bg-transparent pb-3 font-serif text-2xl text-black outline-none focus:border-brand-pink md:text-3xl"
                  />
                </Question>
              )}

              {step === "need" && (
                <Question label="What do you need help with?">
                  <OptionList
                    options={NEED_OPTIONS}
                    value={answers.need}
                    onSelect={(v) => {
                      update("need", v);
                      setDirection(1);
                      setTimeout(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 150);
                    }}
                  />
                </Question>
              )}

              {step === "trigger" && (
                <Question label="What's prompting this right now?" optional>
                  <textarea
                    autoFocus
                    value={answers.trigger}
                    onChange={(e) => update("trigger", e.target.value)}
                    rows={3}
                    placeholder="Optional: a launch, a rebrand, a website that's finally annoyed you enough…"
                    className="w-full border-b-2 border-neutral-300 bg-transparent pb-3 font-serif text-xl text-black outline-none focus:border-brand-pink"
                  />
                </Question>
              )}

              {step === "budget" && (
                <Question label="Roughly what's your budget?">
                  <OptionList
                    options={BUDGET_OPTIONS}
                    value={answers.budget}
                    onSelect={(v) => {
                      update("budget", v);
                      setDirection(1);
                      setTimeout(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 150);
                    }}
                  />
                </Question>
              )}

              {step === "timeline" && (
                <Question label="When do you want to start?">
                  <OptionList
                    options={TIMELINE_OPTIONS}
                    value={answers.timeline}
                    onSelect={(v) => {
                      update("timeline", v);
                      setDirection(1);
                      setTimeout(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 150);
                    }}
                  />
                </Question>
              )}

              {step === "extra" && (
                <Question label="Anything else we should know?" optional>
                  <textarea
                    autoFocus
                    value={answers.extra}
                    onChange={(e) => update("extra", e.target.value)}
                    rows={3}
                    placeholder="Optional"
                    className="w-full border-b-2 border-neutral-300 bg-transparent pb-3 font-serif text-xl text-black outline-none focus:border-brand-pink"
                  />
                </Question>
              )}

              {step === "review" && (
                <div>
                  <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
                    Last check
                  </p>
                  <h2 className="mb-8 font-serif text-3xl text-black">
                    Ready to send this over?
                  </h2>
                  <dl className="mb-10 space-y-3 font-mono text-sm">
                    <Row label="Name" value={answers.name} />
                    <Row label="Email" value={answers.email} />
                    {answers.brandName && <Row label="Brand" value={answers.brandName} />}
                    <Row label="Need" value={answers.need} />
                    <Row label="Budget" value={answers.budget} />
                    <Row label="Timeline" value={answers.timeline} />
                  </dl>
                  {error && (
                    <p className="mb-4 font-mono text-xs text-red-600">{error}</p>
                  )}
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="bg-black px-8 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    {submitting ? "Sending…" : "Send it over"}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {step !== "review" && (
        <div className="flex items-center justify-between px-6 py-8 md:px-10">
          <button
            onClick={back}
            disabled={stepIndex === 0}
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-400 transition-colors hover:text-black disabled:opacity-0"
          >
            ← Back
          </button>
          <button
            onClick={next}
            disabled={!canAdvance()}
            className="bg-black px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function Question({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-6 font-serif text-2xl leading-snug text-black md:text-3xl">
        {label}
        {optional && (
          <span className="ml-2 font-mono text-xs font-normal uppercase tracking-widest text-neutral-400">
            optional
          </span>
        )}
      </p>
      {children}
    </div>
  );
}

function OptionList({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`block w-full rounded-lg border px-4 py-3 text-left font-sans text-base transition-colors ${
            value === opt
              ? "border-black bg-black text-white"
              : "border-neutral-200 text-black hover:border-black"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-neutral-100 pb-2">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="text-black">{value}</dd>
    </div>
  );
}
