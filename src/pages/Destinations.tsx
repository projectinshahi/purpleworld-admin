import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ImageField } from "../components/ImagePicker";
import { Alert, Badge, Button, EmptyState, Field, Input, PageHeader, Spinner, Textarea, Toggle } from "../components/ui";
import { api, ApiError, imageUrl } from "../lib/api";
import type { Destination, DestinationInput } from "../lib/types";
import { useApi } from "../lib/useApi";

const empty: DestinationInput = { title: "", text: "", image: "", link: "", order: 0, published: true };

function DestinationDialog({
  destination,
  nextOrder,
  onClose,
  onSaved,
}: {
  destination: Destination | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: (saved: Destination) => void;
}) {
  const [form, setForm] = useState<DestinationInput>(
    destination ? { ...empty, ...destination } : { ...empty, order: nextOrder },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof DestinationInput>(key: K, value: DestinationInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setError(null);
    try {
      const { title, text, image, link, order, published } = form;
      const saved = await api<Destination>(destination ? `/destinations/${destination._id}` : "/destinations", {
        method: destination ? "PUT" : "POST",
        json: { title, text, image, link, order, published },
      });
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields);
        setError(err.message === "Validation failed" ? "Please fix the highlighted fields." : err.message);
      } else setError("Save failed");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy/50" onClick={onClose} />
      <form onSubmit={handleSubmit} noValidate className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display font-semibold text-navy">{destination ? "Edit destination" : "New destination"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-body hover:bg-navy/5">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {error && <Alert>{error}</Alert>}
          <Field label="Image">
            <ImageField value={form.image} onChange={(url) => set("image", url)} />
          </Field>
          <Field label="Title" error={errors.title}>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} placeholder="e.g. Captivating Kerala" />
          </Field>
          <Field label="Description" error={errors.text}>
            <Textarea value={form.text} onChange={(e) => set("text", e.target.value)} rows={4} aria-invalid={!!errors.text} />
          </Field>
          <Field label="Sort order" hint="Lower numbers appear first">
            <Input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
          </Field>
          <Toggle checked={form.published} onChange={(v) => set("published", v)} label="Published" description="Show in Featured Destinations" />
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Save</Button>
        </div>
      </form>
    </div>
  );
}

export function Destinations() {
  const { data, setData, error, loading } = useApi<Destination[]>("/destinations?all=1");
  const [editing, setEditing] = useState<Destination | "new" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function remove(d: Destination) {
    if (!confirm(`Delete "${d.title}"? It will disappear from the website.`)) return;
    try {
      await api(`/destinations/${d._id}`, { method: "DELETE" });
      setData((list) => list?.filter((x) => x._id !== d._id) ?? null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  function handleSaved(saved: Destination) {
    setData((list) => {
      const others = list?.filter((d) => d._id !== saved._id) ?? [];
      return [...others, saved].sort((a, b) => a.order - b.order);
    });
    setEditing(null);
  }

  const addButton = (
    <Button onClick={() => setEditing("new")}>
      <Plus className="size-4" />
      New destination
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Destinations"
        description="These cards appear in the website's Featured Destinations section, in this order."
        actions={addButton}
      />
      {(error || actionError) && <div className="mb-4"><Alert>{error ?? actionError}</Alert></div>}

      {loading && !data ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState title="No destinations yet" text="Add a destination to show it in Featured Destinations." action={addButton} />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((d) => (
            <li key={d._id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
              {d.image ? (
                <img src={imageUrl(d.image)} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-linear-to-b from-navy to-indigo text-sm text-silver/60">No image</div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  {d.published ? <Badge tone="success">Live</Badge> : <Badge tone="muted">Hidden</Badge>}
                  <span className="text-xs text-body">Order {d.order}</span>
                </div>
                <h3 className="font-display font-semibold text-navy">{d.title}</h3>
                <p className="line-clamp-3 text-sm text-body">{d.text}</p>
                <div className="mt-auto flex gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setEditing(d)} className="flex-1">
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button variant="danger" onClick={() => remove(d)} aria-label={`Delete ${d.title}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <DestinationDialog
          destination={editing === "new" ? null : editing}
          nextOrder={(data?.at(-1)?.order ?? -1) + 1}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
