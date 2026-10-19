"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { SITE } from "@/lib/site";

export type HeroSlide = {
  _id?: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
  displayOrder?: number;
};

const SLIDE_MS = 5500;
const FADE_MS = 1200;

type Props = {
  slides: HeroSlide[];
};

export function HeroSlideshow({ slides }: Props) {
  const labelId = useId();
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const safeSlides =
    slides.length > 0
      ? slides
      : [
          {
            title: "Food & Feast",
            imageUrl: "",
            imageAlt: "",
          },
        ];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion || safeSlides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeSlides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, safeSlides.length]);

  function goTo(next: number) {
    setIndex(next);
  }

  return (
    <section
      className="relative min-h-[68vh] overflow-hidden bg-burgundy-deep sm:min-h-[72vh]"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
    >
      <h2 id={labelId} className="sr-only">
        Homepage highlights
      </h2>

      {/* Background slides */}
      <div className="absolute inset-0" aria-hidden={!reduceMotion}>
        {safeSlides.map((slide, i) => {
          const active = reduceMotion ? i === 0 : i === index;
          const isFirst = i === 0;
          return (
            <div
              key={slide._id ?? `${slide.imageUrl}-${i}`}
              className="absolute inset-0"
              style={{
                opacity: active ? 1 : 0,
                transition: reduceMotion
                  ? "none"
                  : `opacity ${FADE_MS}ms ease-in-out`,
                zIndex: active ? 1 : 0,
              }}
            >
              {slide.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.imageUrl}
                  alt=""
                  className={`h-full w-full object-cover object-center ${
                    reduceMotion
                      ? "scale-[1.02]"
                      : active
                        ? "scale-105 transition-transform duration-[5500ms] ease-out"
                        : "scale-[1.02] transition-transform duration-700 ease-out"
                  }`}
                  loading={isFirst ? "eager" : "lazy"}
                  fetchPriority={isFirst ? "high" : "low"}
                  decoding={isFirst ? "sync" : "async"}
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(160deg,#3a0e16_0%,#6b1e2a_55%,#4a121c_100%)]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Burgundy readability overlay */}
      <div
        className="absolute inset-0 z-[2] bg-[linear-gradient(105deg,rgba(42,14,22,0.88)_0%,rgba(74,18,28,0.72)_42%,rgba(74,18,28,0.45)_70%,rgba(58,14,22,0.35)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 z-[2] h-px bg-gold/40"
        aria-hidden
      />

      {/* Stable foreground content */}
      <div className="relative z-[3] mx-auto flex min-h-[68vh] max-w-[var(--content-max)] flex-col justify-end px-4 pb-14 pt-24 sm:min-h-[72vh] sm:px-6 sm:pb-20 lg:px-8">
        <p className="text-xs tracking-[0.28em] text-gold-soft uppercase">
          {SITE.tagline}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-[2.75rem] leading-[1.05] text-ivory sm:text-6xl md:text-7xl">
          {SITE.name}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/90 sm:text-lg">
          Indian, Chinese, Tandoori and Kshatriya flavours in Old Gajuwaka —
          browse the full digital menu and find your way to the table.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/menu"
            className="rounded-[var(--radius-md)] bg-ivory px-5 py-3 text-sm font-semibold text-burgundy-deep transition hover:bg-gold-soft"
          >
            Explore Menu
          </Link>
          <Link
            href="/contact"
            className="rounded-[var(--radius-md)] border border-ivory/65 px-5 py-3 text-sm font-medium text-ivory transition hover:bg-ivory/10"
          >
            Get Directions
          </Link>
        </div>

        {!reduceMotion && safeSlides.length > 1 ? (
          <div
            className="mt-10 flex items-center gap-2"
            role="tablist"
            aria-label="Hero slides"
          >
            {safeSlides.map((slide, i) => {
              const selected = i === index;
              return (
                <button
                  key={slide._id ?? `dot-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Show slide ${i + 1}: ${slide.title}`}
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory ${
                    selected
                      ? "w-8 bg-ivory"
                      : "w-2.5 bg-ivory/40 hover:bg-ivory/70"
                  }`}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
