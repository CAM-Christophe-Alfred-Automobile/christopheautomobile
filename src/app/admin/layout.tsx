import type { Metadata } from "next";
import ServiceWorkerRegister from "@/components/admin/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: { absolute: "CAMadmin" },
  robots: { index: false, follow: false },
  manifest: "/admin-site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ServiceWorkerRegister />
      {children}
    </div>
  );
}
