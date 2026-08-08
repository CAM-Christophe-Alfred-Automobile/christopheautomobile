"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/finance", label: "Dashboard" },
  { href: "/admin/finance/agenda", label: "Agenda" },
  { href: "/admin/finance/transactions", label: "Transactions" },
  { href: "/admin/finance/accounts", label: "Comptes" },
  { href: "/admin/finance/categories", label: "Catégories" },
  { href: "/admin/finance/recurring", label: "Récurrents" },
  { href: "/admin/finance/purchases", label: "Achats prévus" },
  { href: "/admin/finance/forecast", label: "Prévisions" },
  { href: "/admin/finance/report", label: "Bilan annuel" },
  { href: "/admin/finance/advice", label: "Conseils" },
  { href: "/admin/finance/settings", label: "Réglages" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/finance") return pathname === "/admin/finance";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function FinanceNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-x-auto">
      <ul className="flex gap-1 text-sm whitespace-nowrap">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "block px-3 py-1.5 rounded-md font-semibold text-emerald-400 bg-gray-800"
                    : "block px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
