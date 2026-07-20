"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white " +
  "placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors";

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Erreur lors de la création.");
        return;
      }

      router.push(`/admin/clients/${data.client.id}`);
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Nouveau client</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Prénom</label>
            <input
              className={inputClass}
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom</label>
            <input
              className={inputClass}
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Adresse</label>
          <input
            className={inputClass}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Notes</label>
          <textarea
            className={inputClass}
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !form.firstName || !form.lastName}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Création..." : "Créer le client"}
        </button>
      </form>
    </div>
  );
}
