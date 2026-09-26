import { Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Alert, Badge, Button, EmptyState, PageHeader, Spinner } from "../components/ui";
import { api, ApiError, imageUrl } from "../lib/api";
import type { Package } from "../lib/types";
import { useApi } from "../lib/useApi";

const newPackageLink =
  "inline-flex items-center gap-2 rounded-xl bg-linear-to-b from-gold to-gold-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110";

export function Packages() {
  const { data: packages, setData, error, loading } = useApi<Package[]>("/packages?all=1");
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const destinations = useMemo(
    () => [...new Set(packages?.map((p) => p.destination))].sort(),
    [packages],
  );
  const visible = packages?.filter(
    (p) =>
      (!destination || p.destination === destination) &&
      p.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  async function patch(pkg: Package, changes: Partial<Pick<Package, "published" | "featured">>) {
    setActionError(null);
    try {
      const updated = await api<Package>(`/packages/${pkg._id}`, { method: "PATCH", json: changes });
      setData((list) => list?.map((p) => (p._id === pkg._id ? updated : p)) ?? null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function remove(pkg: Package) {
    if (!confirm(`Delete "${pkg.title}"? This can't be undone.`)) return;
    setActionError(null);
    try {
      await api(`/packages/${pkg._id}`, { method: "DELETE" });
      setData((list) => list?.filter((p) => p._id !== pkg._id) ?? null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  return (
    <>
      <PageHeader
        title="Packages"
        description="Published packages appear on the website's Packages page."
        actions={
          <Link to="/packages/new" className={newPackageLink}>
            <Plus className="size-4" />
            New package
          </Link>
        }
      />
      {(error || actionError) && <div className="mb-4"><Alert>{error ?? actionError}</Alert></div>}

      {loading && !packages ? (
        <Spinner />
      ) : !packages?.length ? (
        <EmptyState
          title="No packages yet"
          text="Create your first package and it will appear on the website once published."
          action={<Link to="/packages/new" className={newPackageLink}>New package</Link>}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <label className="flex min-w-60 flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3.5">
              <Search className="size-4 text-body" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search packages"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm"
              aria-label="Filter by destination"
            >
              <option value="">All destinations</option>
              {destinations.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <ul className="divide-y divide-line">
              {visible?.map((p) => (
                <li key={p._id} className="flex flex-wrap items-center gap-4 p-4">
                  {p.coverImage ? (
                    <img src={imageUrl(p.coverImage)} alt="" className="h-16 w-24 rounded-lg object-cover" />
                  ) : (
                    <span className="h-16 w-24 rounded-lg bg-canvas" />
                  )}
                  <div className="min-w-48 flex-1">
                    <Link to={`/packages/${p._id}`} className="font-semibold text-navy hover:text-gold-dark">
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-body">
                      {p.destination} · {p.nights}N / {p.days}D
                      {p.price > 0 && ` · from ₹${p.price.toLocaleString("en-IN")}`}
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      {p.published ? <Badge tone="success">Live</Badge> : <Badge tone="muted">Draft</Badge>}
                      {p.featured && <Badge tone="gold">Featured</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => patch(p, { featured: !p.featured })}
                      title={p.featured ? "Remove from featured" : "Mark as featured"}
                    >
                      <Star className={`size-4 ${p.featured ? "fill-gold text-gold" : ""}`} />
                    </Button>
                    <Button variant="secondary" onClick={() => patch(p, { published: !p.published })}>
                      {p.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Link
                      to={`/packages/${p._id}`}
                      className="rounded-xl p-2.5 text-body hover:bg-navy/5 hover:text-navy"
                      aria-label={`Edit ${p.title}`}
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <Button variant="ghost" onClick={() => remove(p)} aria-label={`Delete ${p.title}`}>
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  </div>
                </li>
              ))}
              {visible?.length === 0 && (
                <li className="p-8 text-center text-sm text-body">No packages match your search.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
