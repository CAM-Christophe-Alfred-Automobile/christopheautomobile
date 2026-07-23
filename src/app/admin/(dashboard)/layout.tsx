"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const TOP_LEVEL_PATHS = [
  "/admin",
  "/admin/mes-vehicules",
  "/admin/stock",
  "/admin/settings/maintenance-types",
  "/admin/settings/sync-clients",
];

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Clients",
    isActive: (path: string) =>
      path === "/admin" ||
      path.startsWith("/admin/clients") ||
      path.startsWith("/admin/start") ||
      path.startsWith("/admin/interventions"),
  },
  {
    href: "/admin/mes-vehicules",
    label: "Mes véhicules",
    isActive: (path: string) => path.startsWith("/admin/mes-vehicules"),
  },
  {
    href: "/admin/stock",
    label: "Stock",
    isActive: (path: string) => path.startsWith("/admin/stock"),
  },
  {
    href: "/admin/settings/maintenance-types",
    label: "Types d'entretien",
    isActive: (path: string) => path.startsWith("/admin/settings/maintenance-types"),
  },
  {
    href: "/admin/settings/sync-clients",
    label: "Mise à jour des clients",
    isActive: (path: string) => path.startsWith("/admin/settings/sync-clients"),
  },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = !TOP_LEVEL_PATHS.includes(pathname);

  return (
    <>
      <header className="border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            {showBack ? (
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-sm text-gray-300 hover:text-amber-400 transition-colors cursor-pointer flex-shrink-0"
              >
                ← Retour
              </button>
            ) : (
              <Image
                src="/images/CAM-blanc-complet.webp"
                alt="CAM"
                width={36}
                height={36}
                priority
                className="h-9 w-auto flex-shrink-0"
              />
            )}
            <AdminLogoutButton />
          </div>
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.isActive(pathname)
                    ? "font-semibold text-amber-400"
                    : "text-gray-400 hover:text-white transition-colors"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
