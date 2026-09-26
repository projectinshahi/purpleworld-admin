import { Check, ImagePlus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { api, ApiError, imageUrl } from "../lib/api";
import type { Media } from "../lib/types";
import { useApi } from "../lib/useApi";
import { Alert, Button, Spinner } from "./ui";

/** Uploads files to the media library and returns the created records. */
export async function uploadImages(files: FileList | File[]): Promise<Media[]> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return api<Media[]>("/media", { method: "POST", body: form });
}

function PickerDialog({
  multiple,
  initial,
  onClose,
  onDone,
}: {
  multiple: boolean;
  initial: string[];
  onClose: () => void;
  onDone: (urls: string[]) => void;
}) {
  const { data: media, loading, reload } = useApi<Media[]>("/media");
  const [selected, setSelected] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function toggle(url: string) {
    if (!multiple) {
      onDone([url]);
      return;
    }
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]));
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const created = await uploadImages(files);
      await reload();
      if (!multiple && created.length === 1) onDone([created[0].url]);
      else setSelected((s) => [...s, ...created.map((m) => m.url)]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy/60" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display font-semibold text-navy">
            {multiple ? "Choose images" : "Choose an image"}
          </h2>
          <div className="flex items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
            <Button variant="secondary" loading={uploading} onClick={() => fileInput.current?.click()}>
              <Upload className="size-4" />
              Upload new
            </Button>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-body hover:bg-navy/5">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && <div className="mb-4"><Alert>{error}</Alert></div>}
          {loading && !media ? (
            <Spinner />
          ) : media?.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {media.map((m) => {
                const isSelected = selected.includes(m.url);
                return (
                  <li key={m._id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.url)}
                      className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition ${
                        isSelected ? "border-gold" : "border-transparent hover:border-navy/30"
                      }`}
                    >
                      <img src={imageUrl(m.url)} alt={m.alt} className="size-full object-cover" loading="lazy" />
                      {isSelected && (
                        <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-gold text-white">
                          <Check className="size-4" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-12 text-center text-sm text-body">No images yet. Upload one to get started.</p>
          )}
        </div>

        {multiple && (
          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
            <span className="text-sm text-body">{selected.length} selected</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={() => onDone(selected)}>Use selected</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** A single image field: preview + choose / remove. */
export function ImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-line">
          <img src={imageUrl(value)} alt="" className="aspect-[16/10] w-full object-cover" />
          <div className="absolute right-2 bottom-2 flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(true)}>Change</Button>
            <Button type="button" variant="danger" onClick={() => onChange("")}>Remove</Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-sm font-medium text-body transition hover:border-gold hover:text-navy"
        >
          <ImagePlus className="size-8" />
          Choose or upload an image
        </button>
      )}
      {open && (
        <PickerDialog
          multiple={false}
          initial={value ? [value] : []}
          onClose={() => setOpen(false)}
          onDone={([url]) => {
            onChange(url ?? "");
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/** A list of images (e.g. a package gallery). */
export function GalleryField({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-3 gap-2">
        {value.map((url) => (
          <li key={url} className="relative">
            <img src={imageUrl(url)} alt="" className="aspect-square w-full rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              aria-label="Remove image"
              className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-danger shadow"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-line text-body transition hover:border-gold hover:text-navy"
            aria-label="Add images"
          >
            <ImagePlus className="size-6" />
          </button>
        </li>
      </ul>
      {open && (
        <PickerDialog
          multiple
          initial={value}
          onClose={() => setOpen(false)}
          onDone={(urls) => {
            onChange(urls);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
