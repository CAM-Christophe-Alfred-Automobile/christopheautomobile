"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={className ?? "text-sm text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"}
    >
      ← Retour
    </button>
  );
}
