import { CalendarDays, IndianRupee, MapPin, MessageCircle, Phone, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Alert, Button, EmptyState, PageHeader, Spinner } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { useEnquiryCounts } from "../lib/enquiryCounts";
import type { Enquiry, EnquiryStatus } from "../lib/types";
import { useApi } from "../lib/useApi";

const statuses: { value: EnquiryStatus; label: string; tone: string }[] = [
  { value: "new", label: "New", tone: "bg-gold/15 text-gold-dark" },
  { value: "contacted", label: "Contacted", tone: "bg-[#2e8bff]/10 text-[#1f6fd1]" },
  { value: "closed", label: "Closed", tone: "bg-navy/5 text-body" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return formatDate(iso);
}

function EnquiryCard({
  enquiry,
  onChange,
  onDelete,
}: {
  enquiry: Enquiry;
  onChange: (updated: Enquiry) => void;
  onDelete: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const digits = enquiry.phone.replace(/\D/g, "");

  async function update(patch: Partial<Pick<Enquiry, "status" | "adminNotes">>) {
    setSaving(true);
    setError(null);
    try {
      onChange(await api<Enquiry>(`/enquiries/${enquiry._id}`, { method: "PATCH", json: patch }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const details = [
    { icon: CalendarDays, label: "Travel date", value: formatDate(enquiry.travelDate) },
    { icon: MapPin, label: "Destination", value: enquiry.destination },
    { icon: IndianRupee, label: "Budget", value: enquiry.budget },
    { icon: Users, label: "Travellers", value: String(enquiry.travelers) },
  ];

  return (
    <li
      className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 lg:p-6 ${
        enquiry.status === "new" ? "border-gold/50 shadow-sm" : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-navy">{enquiry.fullName}</h3>
          <p className="text-xs text-body" title={new Date(enquiry.createdAt).toLocaleString("en-IN")}>
            Received {timeAgo(enquiry.createdAt)}
          </p>
        </div>
        <div className="flex rounded-xl border border-line p-1" role="group" aria-label="Status">
          {statuses.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={saving}
              onClick={() => enquiry.status !== s.value && update({ status: s.value })}
              aria-pressed={enquiry.status === s.value}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                enquiry.status === s.value ? s.tone : "text-body hover:text-navy"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="flex flex-wrap gap-2">
        <a
          href={`tel:+${digits}`}
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-silver hover:bg-indigo"
        >
          <Phone className="size-4 text-gold" />
          {enquiry.phone}
        </a>
        <a
          href={`https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${enquiry.fullName}, thank you for contacting Purpleworld Tours about your ${enquiry.destination} trip.`)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-[#25d366]/40 px-4 py-2 text-sm font-semibold text-[#128c4a] hover:bg-[#25d366]/10"
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </a>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-canvas px-3.5 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-body">
              <Icon className="size-3.5 text-gold" />
              {label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-navy">{value}</dd>
          </div>
        ))}
      </dl>

      {enquiry.notes && (
        <div>
          <p className="text-xs font-semibold text-body">Their message</p>
          <p className="mt-1 text-sm whitespace-pre-line text-ink">{enquiry.notes}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`notes-${enquiry._id}`} className="text-xs font-semibold text-body">
          Team notes (private)
        </label>
        <textarea
          id={`notes-${enquiry._id}`}
          defaultValue={enquiry.adminNotes}
          rows={2}
          placeholder="e.g. Called on 26 Sep, sending quote tomorrow"
          onBlur={(e) => {
            const value = e.target.value.trim();
            if (value !== enquiry.adminNotes) void update({ adminNotes: value });
          }}
          className="w-full resize-y rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-3 focus:ring-gold/20"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onDelete} className="text-danger">
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
    </li>
  );
}

export function Enquiries() {
  const [filter, setFilter] = useState<EnquiryStatus | "all">("new");
  const { data, setData, error, loading } = useApi<Enquiry[]>(
    filter === "all" ? "/enquiries" : `/enquiries?status=${filter}`,
  );
  const { counts, refresh: refreshCounts } = useEnquiryCounts();
  const [actionError, setActionError] = useState<string | null>(null);

  function handleChange(updated: Enquiry) {
    // Keep the card in place until the tab changes, so a misclick is easy to undo
    setData((list) => list?.map((e) => (e._id === updated._id ? updated : e)) ?? null);
    void refreshCounts();
  }

  async function remove(enquiry: Enquiry) {
    if (!confirm(`Delete the enquiry from ${enquiry.fullName}? This can't be undone.`)) return;
    try {
      await api(`/enquiries/${enquiry._id}`, { method: "DELETE" });
      setData((list) => list?.filter((e) => e._id !== enquiry._id) ?? null);
      void refreshCounts();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  const tabs: { value: EnquiryStatus | "all"; label: string; count?: number }[] = [
    ...statuses.map((s) => ({ value: s.value, label: s.label, count: counts?.[s.value] })),
    { value: "all", label: "All" },
  ];

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Requests sent from the website's “Start Your Journey” form."
      />

      <div className="mb-5 flex flex-wrap gap-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={filter === t.value}
            onClick={() => setFilter(t.value)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === t.value ? "bg-navy text-silver" : "border border-line bg-white text-navy hover:border-navy/40"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${filter === t.value ? "bg-white/15" : "bg-canvas"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {(error || actionError) && <div className="mb-4"><Alert>{error ?? actionError}</Alert></div>}

      {loading && !data ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState
          title={filter === "new" ? "No new enquiries" : "Nothing here"}
          text={filter === "new" ? "New requests from the website will appear here." : "No enquiries with this status."}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {data.map((enquiry) => (
            <EnquiryCard
              key={enquiry._id}
              enquiry={enquiry}
              onChange={handleChange}
              onDelete={() => void remove(enquiry)}
            />
          ))}
        </ul>
      )}
    </>
  );
}
