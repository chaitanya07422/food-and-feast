"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  AdminAlert,
  AdminEmptyState,
  AdminPageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { api } from "@/lib/api";

type GalleryImage = {
  _id: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
  displayOrder: number;
  isPublished: boolean;
};

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
};

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const list = await api.get<GalleryImage[]>("/admin/gallery");
    setImages(list);
  }, []);

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [load]);

  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearPending() {
    setPending((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
  }

  function onPickMany(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    const next: PendingFile[] = [];
    const rejected: string[] = [];

    Array.from(fileList).forEach((file) => {
      if (!ALLOWED.has(file.type)) {
        rejected.push(`${file.name} (type)`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        rejected.push(`${file.name} (>5MB)`);
        return;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    setPending((prev) => [...prev, ...next]);
    if (rejected.length) {
      setError(`Skipped: ${rejected.join(", ")}`);
    }
  }

  function removePending(id: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending.length === 0) {
      setError("Choose one or more restaurant photos.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    let ok = 0;
    const failed: string[] = [];

    try {
      let order = images.length;
      for (let i = 0; i < pending.length; i++) {
        const item = pending[i];
        setProgress(`Uploading ${i + 1} of ${pending.length}…`);
        try {
          const uploaded = await api.uploadImage(item.file);
          const baseName = item.file.name.replace(/\.[^.]+$/, "");
          await api.post("/admin/gallery", {
            title:
              baseName.replace(/[_-]+/g, " ").trim() || `Photo ${order + 1}`,
            imageUrl: uploaded.url,
            imageAlt: `Food & Feast restaurant — ${baseName}`,
            displayOrder: order,
            isPublished: true,
          });
          order += 1;
          ok += 1;
        } catch {
          failed.push(item.file.name);
        }
      }
      clearPending();
      await load();
      if (ok && !failed.length) {
        setMessage(`Added ${ok} photo${ok === 1 ? "" : "s"} to the gallery.`);
      } else if (ok && failed.length) {
        setMessage(`Added ${ok} photo(s). Failed: ${failed.join(", ")}`);
      } else {
        setError(`Upload failed for: ${failed.join(", ")}`);
      }
    } finally {
      setProgress("");
      setSaving(false);
    }
  }

  async function togglePublish(img: GalleryImage) {
    await api.patch(`/admin/gallery/${img._id}`, {
      isPublished: !img.isPublished,
    });
    await load();
  }

  async function onDelete(img: GalleryImage) {
    if (!confirm(`Remove “${img.title}” from the gallery?`)) return;
    try {
      await api.delete(`/admin/gallery/${img._id}`);
      setMessage("Photo removed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Media"
        title="Restaurant gallery"
        description="Upload restaurant photographs. Published images appear on the public Gallery page."
      />

      {message ? <AdminAlert tone="success">{message}</AdminAlert> : null}
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      <form onSubmit={onSubmit} className="admin-card space-y-4 p-4 sm:p-6">
        <h2 className="font-display text-xl">Add photos</h2>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onPickMany(e.dataTransfer.files);
          }}
          className={`rounded-[var(--radius-lg)] border-2 border-dashed px-4 py-10 text-center transition-colors ${
            dragOver
              ? "border-burgundy bg-[color-mix(in_srgb,var(--ff-burgundy)_6%,white)]"
              : "border-border bg-ivory/50"
          }`}
        >
          <Upload className="mx-auto text-gold" size={22} aria-hidden />
          <p className="mt-3 text-sm font-medium text-charcoal">
            Drag and drop photos here
          </p>
          <p className="mt-1 text-xs text-muted">
            JPEG, PNG, WebP, or GIF · max 5MB each
          </p>
          <button
            type="button"
            className="btn-secondary mt-4 !py-2"
            onClick={() => inputRef.current?.click()}
          >
            Choose files
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              onPickMany(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {pending.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pending.map((item) => (
              <li
                key={item.id}
                className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
                <p className="truncate px-2 py-1 text-[10px] text-muted">
                  {item.file.name}
                </p>
                <button
                  type="button"
                  onClick={() => removePending(item.id)}
                  className="absolute top-1.5 right-1.5 rounded bg-charcoal/80 px-1.5 py-0.5 text-[10px] text-ivory"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || pending.length === 0}
            className="btn-primary"
          >
            {saving
              ? progress || "Uploading…"
              : pending.length
                ? `Upload ${pending.length} photo${pending.length === 1 ? "" : "s"}`
                : "Upload photos"}
          </button>
          {pending.length > 0 && !saving ? (
            <button
              type="button"
              onClick={clearPending}
              className="text-sm text-muted underline-offset-2 hover:underline"
            >
              Clear selection
            </button>
          ) : null}
        </div>
      </form>

      {images.length === 0 ? (
        <AdminEmptyState
          title="No gallery photos yet"
          description="Select multiple files above to upload restaurant photographs."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <li
              key={img._id}
              className="admin-card group overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-ivory-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.imageAlt || img.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-charcoal/75 to-transparent px-3 pt-8 pb-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => togglePublish(img)}
                    className="rounded bg-ivory/95 px-2.5 py-1 text-xs font-medium text-burgundy"
                  >
                    {img.isPublished ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(img)}
                    className="rounded bg-ivory/95 px-2.5 py-1 text-xs font-medium text-[var(--ff-danger)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium">{img.title}</p>
                  <StatusBadge tone={img.isPublished ? "success" : "neutral"}>
                    {img.isPublished ? "Published" : "Hidden"}
                  </StatusBadge>
                </div>
                <p className="truncate text-[0.65rem] text-muted">
                  {img.imageAlt || "No alt text"}
                </p>
                <div className="flex gap-3 pt-1 text-sm md:hidden">
                  <button
                    type="button"
                    onClick={() => togglePublish(img)}
                    className="font-medium text-burgundy"
                  >
                    {img.isPublished ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(img)}
                    className="font-medium text-[var(--ff-danger)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
