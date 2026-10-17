"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
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
    // Only revoke on unmount
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
            title: baseName.replace(/[_-]+/g, " ").trim() || `Photo ${order + 1}`,
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
    await api.delete(`/admin/gallery/${img._id}`);
    setMessage("Photo removed.");
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Restaurant gallery</h1>
        <p className="mt-2 text-sm text-muted">
          Upload multiple restaurant photos at once. They appear on the public
          Gallery page when published.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-6"
      >
        <h2 className="font-display text-2xl">Add photos</h2>
        <label className="block text-sm">
          Select multiple images
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              onPickMany(e.target.files);
              e.target.value = "";
            }}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-burgundy file:px-3 file:py-2 file:text-sm file:font-medium file:text-ivory"
          />
        </label>
        <p className="text-xs text-muted">
          JPEG, PNG, WebP, or GIF · max 5MB each · hold Cmd/Ctrl to select many
        </p>

        {pending.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pending.map((item) => (
              <li
                key={item.id}
                className="relative overflow-hidden rounded-lg border border-border"
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
                  className="absolute top-1 right-1 rounded bg-charcoal/80 px-1.5 py-0.5 text-[10px] text-ivory"
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
            className="rounded-md bg-burgundy px-4 py-2 text-sm font-medium text-ivory disabled:opacity-60"
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

        {message ? <p className="text-sm text-[#3d6b4f]">{message}</p> : null}
        {error ? (
          <p className="text-sm text-[#8b2e2e]" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <li
            key={img._id}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]"
          >
            <div className="relative aspect-[4/3] bg-ivory-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.imageAlt || img.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 p-3">
              <p className="font-medium">{img.title}</p>
              <p className="text-xs text-muted">
                {img.isPublished ? "Published" : "Hidden"}
              </p>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => togglePublish(img)}
                  className="text-burgundy underline-offset-2 hover:underline"
                >
                  {img.isPublished ? "Hide" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(img)}
                  className="text-[#8b2e2e] underline-offset-2 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {images.length === 0 ? (
        <p className="text-sm text-muted">
          No gallery photos yet. Select multiple files above to upload.
        </p>
      ) : null}
    </div>
  );
}
