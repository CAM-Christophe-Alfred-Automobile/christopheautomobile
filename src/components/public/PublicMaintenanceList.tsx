"use client";

import { useState } from "react";
import AlertBadge from "@/components/admin/AlertBadge";
import type { AlertStatus } from "@/services/admin/maintenanceAlerts";

interface MaintenanceItem {
  maintenanceTypeId: string;
  label: string;
  status: AlertStatus;
  updatedByClient: boolean;
}

const inputClass =
  "px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-amber-500";

function MaintenanceRow({ item, vehicleId }: { item: MaintenanceItem; vehicleId: string }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setSaving(true);
    await fetch(`/api/vehicule/${vehicleId}/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maintenanceTypeId: item.maintenanceTypeId, lastDoneDate: date }),
    });
    setSaving(false);
    setEditing(false);
    setDone(true);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-300">{item.label}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(item.updatedByClient || done) && (
            <span className="inline-flex items-center text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded border bg-purple-600/20 border-purple-600/50 text-purple-400">
              🙋 Signalé par vous
            </span>
          )}
          <AlertBadge status={done ? "ok" : item.status} />
        </div>
      </div>
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-500 hover:text-amber-400 cursor-pointer mt-1"
        >
          + Signaler comme fait (ailleurs)
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <input
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={submit}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded bg-amber-500 text-gray-900 font-semibold disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Envoi..." : "Confirmer"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

export default function PublicMaintenanceList({
  items,
  vehicleId,
}: {
  items: MaintenanceItem[];
  vehicleId: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {items.map((item) => (
        <MaintenanceRow key={item.maintenanceTypeId} item={item} vehicleId={vehicleId} />
      ))}
    </div>
  );
}
