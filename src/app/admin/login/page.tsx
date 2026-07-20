"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Échec de la connexion.");
        return;
      }

      // A plain router.push() here can lose the navigation to a router.refresh()
      // racing on the still-current /admin/login route — a full navigation avoids
      // that Next.js App Router timing issue entirely.
      window.location.assign("/admin");
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4"
      >
        <div className="flex justify-center">
          <Image
            src="/images/CAM-blanc-complet.webp"
            alt="CAM"
            width={56}
            height={56}
            priority
            className="h-14 w-auto"
          />
        </div>
        <h1 className="text-xl font-semibold text-white text-center">
          Espace privé
        </h1>

        <div>
          <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm
                       text-white placeholder-gray-500 focus:outline-none focus:border-amber-500
                       focus:ring-1 focus:ring-amber-500 transition-colors"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500
                     text-gray-900 font-semibold text-sm disabled:opacity-50
                     disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
