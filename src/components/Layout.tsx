import { Inbox, LogOut, MapPin, Menu, Package, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "../lib/auth";
import { useEnquiryCounts } from "../lib/enquiryCounts";

const nav = [
  { to: "/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/packages", label: "Packages", icon: Package },
  { to: "/destinations", label: "Destinations", icon: MapPin },
];

export function Layout() {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { counts } = useEnquiryCounts();

  const sidebar = (
    <div className="flex h-full flex-col gap-6 bg-linear-to-b from-navy to-indigo p-5 text-silver">
      <div className="flex items-center justify-between">
        <img src="/logo.png" alt="Purpleworld Tours" className="h-14 w-auto" />
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-6" />
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-white/10 text-gold" : "text-silver/80 hover:bg-white/5 hover:text-silver"
              }`
            }
          >
            <Icon className="size-5" />
            {label}
            {to === "/enquiries" && !!counts?.new && (
              <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">
                {counts.new}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-silver/80 hover:bg-white/5 hover:text-silver"
        >
          <LogOut className="size-5" />
          Log out
        </button>
        <p className="truncate px-3.5 pt-2 text-xs text-silver/50">{admin?.email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-navy">
          <Menu className="size-6" />
        </button>
        <span className="font-display font-semibold text-navy">Purpleworld Admin</span>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
