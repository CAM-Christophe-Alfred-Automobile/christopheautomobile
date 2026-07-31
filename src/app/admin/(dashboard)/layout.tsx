"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import AdminMoreMenu from "@/components/admin/AdminMoreMenu";
import CamFinanceLink from "@/components/admin/CamFinanceLink";

const TOP_LEVEL_PATHS = [
  "/admin",
  "/admin/mes-vehicules",
  "/admin/stock",
  "/admin/qr-codes",
  "/admin/calcul-prix",
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
    href: "/admin/calcul-prix",
    label: "Calcul prix",
    isActive: (path: string) => path.startsWith("/admin/calcul-prix"),
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
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-gray-500 capitalize hidden sm:inline">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <AdminMoreMenu />
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
            {NAV_ITEMS.map((item) => (
              <Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={
                    item.isActive(pathname)
                      ? "font-semibold text-amber-400"
                      : "text-gray-400 hover:text-white transition-colors"
                  }
                >
                  {item.label}
                </Link>
                {item.href === "/admin/calcul-prix" && <CamFinanceLink />}
              </Fragment>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
