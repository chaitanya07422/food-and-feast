"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  AdminAlert,
  AdminEmptyState,
  AdminPageHeader,
  Field,
  StatusBadge,
} from "@/components/admin/ui";
import { api } from "@/lib/api";

type HeroSlide = {
  _id: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
  displayOrder: number;
  isActive: boolean;
};

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({});

  const sorted = useMemo(
    () => [...slides].sort((a, b) => a.displayOrder - b.displayOrder),
    [slides],
  );

  const load = useCallback(async () => {
    const list = await api.get<HeroSlide[]>("/admin/hero/slides");
    setSlides(list);
    const drafts: Record<string, string> = {};
    list.forEach((s) => {
      drafts[s._id] = String(s.displayOrder + 1);
    });
    setOrderDrafts(drafts);
  }, []);

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [load]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onPick(next: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!next) {
      setFile(null);
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(next);
    const probe = new Image();
    probe.onload = () => {
      if (probe.height > probe.width) {
        URL.revokeObjectURL(objectUrl);
        setError(
          "Please upload a landscape (horizontal) image for the hero slideshow.",
        );
        setFile(null);
        setPreview(null);
        return;
      }
      setError(null);
      setFile(next);
      setPreview(objectUrl);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("Could not read that image.");
    };
    probe.src = objectUrl;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a landscape hero image.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const uploaded = await api.uploadImage(file);
      const nextOrder =
        slides.length === 0
          ? 0
          : Math.max(...slides.map((s) => s.displayOrder)) + 1;
      await api.post("/admin/hero/slides", {
        title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
        imageUrl: uploaded.url,
        imageAlt: title.trim() || "Food & Feast homepage hero",
        displayOrder: nextOrder,
        isActive: true,
      });
      setTitle("");
      onPick(null);
      setMessage("Hero slide added at the end of the animation order.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(slide: HeroSlide) {
    await api.patch(`/admin/hero/slides/${slide._id}`, {
      isActive: !slide.isActive,
    });
    await load();
  }

  async function move(slide: HeroSlide, direction: -1 | 1) {
    const idx = sorted.findIndex((s) => s._id === slide._id);
    const swapWith = sorted[idx + direction];
    if (!swapWith) return;
    setError(null);
    try {
      await Promise.all([
        api.patch(`/admin/hero/slides/${slide._id}`, {
          displayOrder: swapWith.displayOrder,
        }),
        api.patch(`/admin/hero/slides/${swapWith._id}`, {
          displayOrder: slide.displayOrder,
        }),
      ]);
      setMessage("Slideshow order updated.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reorder");
    }
  }

  async function saveOrder(slide: HeroSlide) {
    const raw = orderDrafts[slide._id];
    const position = Number.parseInt(raw, 10);
    if (!Number.isFinite(position) || position < 1 || position > sorted.length) {
      setError(`Order must be between 1 and ${sorted.length}.`);
      return;
    }

    const targetIndex = position - 1;
    const without = sorted.filter((s) => s._id !== slide._id);
    const reordered = [
      ...without.slice(0, targetIndex),
      slide,
      ...without.slice(targetIndex),
    ];

    setError(null);
    try {
      await Promise.all(
        reordered.map((s, i) =>
          api.patch(`/admin/hero/slides/${s._id}`, { displayOrder: i }),
        ),
      );
      setMessage(`“${slide.title}” is now slide ${position} in the animation.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save order");
    }
  }

  async function onDelete(slide: HeroSlide) {
    if (!confirm(`Remove hero slide “${slide.title}”?`)) return;
    try {
      await api.delete(`/admin/hero/slides/${slide._id}`);
      setMessage("Slide removed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Homepage"
        title="Hero slides"
        description="Landscape photos for the homepage slideshow. Order 1 plays first, then 2, then 3…"
      />

      {message ? <AdminAlert tone="success">{message}</AdminAlert> : null}
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      <form onSubmit={onSubmit} className="admin-card space-y-4 p-4 sm:p-6">
        <h2 className="font-display text-xl">Add slide</h2>
        <div className="grid gap-4 sm:grid-cols-[16rem_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-dashed border-border bg-ivory">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
                Landscape preview
              </span>
            )}
          </div>
          <div className="space-y-3">
            <Field label="Label (internal)" htmlFor="hero-title">
              <input
                id="hero-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Biryani"
                className="admin-input"
              />
            </Field>
            <Field
              label="Landscape image"
              htmlFor="hero-file"
              help="Horizontal photos only. JPEG, PNG, or WebP."
            >
              <input
                id="hero-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-burgundy file:px-3 file:py-2 file:text-sm file:font-medium file:text-ivory"
              />
            </Field>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Add slide"}
            </button>
          </div>
        </div>
      </form>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl">Slideshow order</h2>
          <p className="mt-1 text-sm text-muted">
            Use ↑ ↓ or type a position and click Set.
          </p>
        </div>

        {sorted.length === 0 ? (
          <AdminEmptyState
            title="No slides yet"
            description="Add landscape photos above to build the homepage hero."
          />
        ) : (
          <ol className="space-y-3">
            {sorted.map((slide, index) => (
              <li
                key={slide._id}
                className="admin-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy font-display text-lg text-ivory">
                  {index + 1}
                </div>
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-ivory-deep sm:w-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{slide.title}</p>
                    <StatusBadge tone={slide.isActive ? "success" : "neutral"}>
                      {slide.isActive ? "On homepage" : "Hidden"}
                    </StatusBadge>
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="block text-xs text-muted">
                      Play as #
                      <input
                        type="number"
                        min={1}
                        max={sorted.length}
                        value={orderDrafts[slide._id] ?? String(index + 1)}
                        onChange={(e) =>
                          setOrderDrafts((prev) => ({
                            ...prev,
                            [slide._id]: e.target.value,
                          }))
                        }
                        className="admin-input mt-1 !w-16"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => saveOrder(slide)}
                      className="btn-secondary !py-2 !text-xs"
                    >
                      Set
                    </button>
                    <button
                      type="button"
                      onClick={() => move(slide, -1)}
                      disabled={index === 0}
                      className="btn-secondary gap-1 !px-2.5 !py-2"
                      aria-label="Move earlier"
                    >
                      <ArrowUp size={14} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(slide, 1)}
                      disabled={index === sorted.length - 1}
                      className="btn-secondary gap-1 !px-2.5 !py-2"
                      aria-label="Move later"
                    >
                      <ArrowDown size={14} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(slide)}
                      className="text-sm font-medium text-burgundy underline-offset-2 hover:underline"
                    >
                      {slide.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(slide)}
                      className="text-sm font-medium text-[var(--ff-danger)] underline-offset-2 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
