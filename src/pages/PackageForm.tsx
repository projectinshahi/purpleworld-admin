import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { GalleryField, ImageField } from "../components/ImagePicker";
import { Alert, Button, Card, Field, Input, PageHeader, Spinner, Textarea, Toggle } from "../components/ui";
import { api, ApiError } from "../lib/api";
import type { Package, PackageInput } from "../lib/types";
import { useApi } from "../lib/useApi";

const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL ?? "http://localhost:3000";

const empty: PackageInput = {
  title: "",
  slug: "",
  destination: "",
  nights: 0,
  days: 1,
  summary: "",
  description: "",
  route: [],
  itinerary: [],
  inclusions: [],
  exclusions: [],
  price: 0,
  coverImage: "",
  gallery: [],
  featured: false,
  published: true,
  order: 0,
};

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function PackageForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const existing = useApi<Package>(isNew ? null : `/packages/${id}`);
  const all = useApi<Package[]>("/packages?all=1");
  const [form, setForm] = useState<PackageInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing.data) {
      const { _id: _unused, updatedAt: _u, ...input } = existing.data;
      setForm({ ...empty, ...input });
    }
  }, [existing.data]);

  const destinationOptions = [...new Set(all.data?.map((p) => p.destination))].sort();
  const set = <K extends keyof PackageInput>(key: K, value: PackageInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const routeNights = form.route.reduce((sum, stop) => sum + (Number(stop.nights) || 0), 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      const saved = await api<Package>(isNew ? "/packages" : `/packages/${id}`, {
        method: isNew ? "POST" : "PUT",
        json: form,
      });
      if (isNew) {
        navigate(`/packages/${saved._id}`, { replace: true });
      } else {
        setForm((f) => ({ ...f, slug: saved.slug }));
      }
      setMessage({ tone: "success", text: "Package saved." });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields);
        setMessage({ tone: "error", text: err.message === "Validation failed" ? "Please fix the highlighted fields." : err.message });
      } else {
        setMessage({ tone: "error", text: "Save failed" });
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && existing.loading && !existing.data) return <Spinner />;
  if (!isNew && existing.error) return <Alert>{existing.error}</Alert>;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Link to="/packages" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-navy">
        <ArrowLeft className="size-4" />
        All packages
      </Link>
      <PageHeader
        title={isNew ? "New package" : form.title || "Edit package"}
        description={
          isNew ? "Fill in the details, then save." : `Website address: /packages/${form.slug}`
        }
        actions={
          <>
            {!isNew && form.published && (
              <a
                href={`${WEBSITE_URL}/packages/${form.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-navy/40"
              >
                View on website
              </a>
            )}
            <Button type="submit" loading={saving}>Save package</Button>
          </>
        }
      />

      {message && (
        <div className="mb-5">
          {message.tone === "error" ? (
            <Alert>{message.text}</Alert>
          ) : (
            <div role="status" className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm font-medium text-success">
              {message.text}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Package name" error={errors.title} className="sm:col-span-2">
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} placeholder="e.g. The Classic Circuit" />
              </Field>
              <Field label="Destination" hint="Used to group packages on the website, e.g. Kerala, Asia" error={errors.destination}>
                <Input value={form.destination} onChange={(e) => set("destination", e.target.value)} list="destination-options" aria-invalid={!!errors.destination} />
                <datalist id="destination-options">
                  {destinationOptions.map((d) => <option key={d} value={d} />)}
                </datalist>
              </Field>
              <Field label="Web address (slug)" hint="Leave empty to create it from the name" error={errors.slug}>
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="the-classic-circuit" aria-invalid={!!errors.slug} />
              </Field>
              <Field label="Nights" error={errors.nights} hint={routeNights > 0 && routeNights !== form.nights ? `Route adds up to ${routeNights} nights` : undefined}>
                <Input type="number" min={0} value={form.nights} onChange={(e) => set("nights", Number(e.target.value))} aria-invalid={!!errors.nights} />
              </Field>
              <Field label="Days" error={errors.days}>
                <Input type="number" min={1} value={form.days} onChange={(e) => set("days", Number(e.target.value))} aria-invalid={!!errors.days} />
              </Field>
              <Field label="Starting price per person (₹)" hint="Leave 0 to show “Price on request”" error={errors.price} className="sm:col-span-2">
                <Input type="number" min={0} step={500} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
              </Field>
              <Field label="Short summary" hint="Shown on the package card" error={errors.summary} className="sm:col-span-2">
                <Textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={3} aria-invalid={!!errors.summary} />
              </Field>
              <Field label="Full description" hint="Shown on the package page. Leave a blank line between paragraphs." className="sm:col-span-2">
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={6} />
              </Field>
            </div>
          </Card>

          <Card
            title="Route"
            actions={
              <Button type="button" variant="secondary" onClick={() => set("route", [...form.route, { place: "", nights: 1 }])}>
                <Plus className="size-4" /> Add stop
              </Button>
            }
          >
            {form.route.length === 0 ? (
              <p className="text-sm text-body">Add the places in order, e.g. Kochi (1 night) → Munnar (2 nights).</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {form.route.map((stop, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-6 text-center text-sm font-semibold text-body">{i + 1}</span>
                    <Input
                      value={stop.place}
                      placeholder="Place"
                      onChange={(e) => set("route", form.route.map((s, j) => (j === i ? { ...s, place: e.target.value } : s)))}
                    />
                    <div className="w-28 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        value={stop.nights}
                        aria-label="Nights"
                        onChange={(e) => set("route", form.route.map((s, j) => (j === i ? { ...s, nights: Number(e.target.value) } : s)))}
                      />
                    </div>
                    <span className="text-xs text-body">nights</span>
                    <Button type="button" variant="ghost" onClick={() => set("route", move(form.route, i, i - 1))} aria-label="Move up"><ArrowUp className="size-4" /></Button>
                    <Button type="button" variant="ghost" onClick={() => set("route", move(form.route, i, i + 1))} aria-label="Move down"><ArrowDown className="size-4" /></Button>
                    <Button type="button" variant="ghost" onClick={() => set("route", form.route.filter((_, j) => j !== i))} aria-label="Remove stop"><Trash2 className="size-4 text-danger" /></Button>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card
            title="Day-by-day itinerary"
            actions={
              <Button type="button" variant="secondary" onClick={() => set("itinerary", [...form.itinerary, { title: "", text: "" }])}>
                <Plus className="size-4" /> Add day
              </Button>
            }
          >
            {form.itinerary.length === 0 ? (
              <p className="text-sm text-body">Add one entry per day.</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {form.itinerary.map((day, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border border-line p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-gold to-gold-dark text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <div className="flex flex-1 flex-col gap-2">
                      <Input
                        value={day.title}
                        placeholder="Day title, e.g. Arrive in Kochi"
                        onChange={(e) => set("itinerary", form.itinerary.map((d, j) => (j === i ? { ...d, title: e.target.value } : d)))}
                      />
                      <Textarea
                        value={day.text}
                        rows={2}
                        placeholder="What happens this day"
                        onChange={(e) => set("itinerary", form.itinerary.map((d, j) => (j === i ? { ...d, text: e.target.value } : d)))}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Button type="button" variant="ghost" onClick={() => set("itinerary", move(form.itinerary, i, i - 1))} aria-label="Move up"><ArrowUp className="size-4" /></Button>
                      <Button type="button" variant="ghost" onClick={() => set("itinerary", move(form.itinerary, i, i + 1))} aria-label="Move down"><ArrowDown className="size-4" /></Button>
                      <Button type="button" variant="ghost" onClick={() => set("itinerary", form.itinerary.filter((_, j) => j !== i))} aria-label="Remove day"><Trash2 className="size-4 text-danger" /></Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="What's included">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Inclusions" hint="One per line">
                <Textarea
                  rows={6}
                  value={form.inclusions.join("\n")}
                  onChange={(e) => set("inclusions", e.target.value.split("\n"))}
                  placeholder={"Hotel stays with breakfast\nPrivate AC car with driver"}
                />
              </Field>
              <Field label="Exclusions" hint="One per line">
                <Textarea
                  rows={6}
                  value={form.exclusions.join("\n")}
                  onChange={(e) => set("exclusions", e.target.value.split("\n"))}
                  placeholder={"Flights\nEntry tickets"}
                />
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Visibility">
            <div className="flex flex-col gap-4">
              <Toggle checked={form.published} onChange={(v) => set("published", v)} label="Published" description="Show on the website" />
              <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Featured" description="Highlight at the top of the Packages page" />
              <Field label="Sort order" hint="Lower numbers appear first">
                <Input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
              </Field>
            </div>
          </Card>
          <Card title="Cover image">
            <ImageField value={form.coverImage} onChange={(url) => set("coverImage", url)} />
          </Card>
          <Card title="Gallery">
            <GalleryField value={form.gallery} onChange={(urls) => set("gallery", urls)} />
          </Card>
        </div>
      </div>
    </form>
  );
}
