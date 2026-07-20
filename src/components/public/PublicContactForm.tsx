"use client";

import { useState } from "react";

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500";

interface ClientInfo {
  firstName: string;
  lastName: string;
  address: string | null;
  email: string | null;
  phone: string | null;
}

export default function PublicContactForm({
  vehicleId,
  initial,
}: {
  vehicleId: string;
  initial: ClientInfo;
}) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName === "." ? "" : initial.lastName);
  const [address, setAddress] = useState(initial.address ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/vehicule/${vehicleId}/client`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName: lastName || ".",
        address: address || null,
        email: email || null,
        phone: phone || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-gray-500 hover:text-amber-400 cursor-pointer">
        {saved ? "✓ Coordonnées mises à jour — modifier à nouveau" : "✏️ Modifier mes coordonnées"}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2 bg-gray-900 border border-gray-800 rounded-lg p-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputClass}
          required
        />
        <input
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={inputClass}
        />
      </div>
      <input
        placeholder="Adresse"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className={inputClass}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />
      <input
        placeholder="Téléphone / WhatsApp"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputClass}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="text-xs px-3 py-1.5 rounded bg-amber-500 text-gray-900 font-semibold disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Envoi..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
