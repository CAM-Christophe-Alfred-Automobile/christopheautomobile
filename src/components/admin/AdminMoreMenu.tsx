"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MENU_ITEMS = [
  { href: "/admin/settings/maintenance-types", label: "Types d'entretien" },
  { href: "/admin/qr-codes", label: "QR codes" },
  { href: "/admin/settings/sync-clients", label: "Mise à jour des clients" },
];

export default function AdminMoreMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer text-lg leading-none"
        aria-label="Menu"
      >
        ⋮
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-700 bg-gray-900 shadow-lg z-30 py-1">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-1 border-t border-gray-800" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </>
      )}
    </div>
  );
}
