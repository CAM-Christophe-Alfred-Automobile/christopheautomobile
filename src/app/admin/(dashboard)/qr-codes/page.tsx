"use client";

import { useEffect, useState } from "react";
import JSZip from "jszip";
import { generateBrandedQr, slugifyForFilename, QR_COLORS } from "@/lib/qrCode";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

interface VehicleRow {
  id: string;
  label: string;
  ownerLabel: string;
}

interface ClientApi {
  firstName: string;
  lastName: string;
  vehicles: { id: string; plate: string | null; make: string | null; model: string | null; sold: boolean }[];
}

export default function QrCodesExportPage() {
  const [rows, setRows] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [color, setColor] = useState(QR_COLORS[0].hex);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch("/api/admin/personal-vehicles").then((r) => r.json()),
    ]).then(([clientsRes, personalRes]) => {
      const clients: ClientApi[] = [
        ...(clientsRes.success ? clientsRes.clients : []),
        ...(personalRes.success ? personalRes.clients : []),
      ];
      const vehicleRows: VehicleRow[] = [];
      for (const client of clients) {
        const ownerLabel = [client.firstName, client.lastName !== "." ? client.lastName : ""]
          .filter(Boolean)
          .join(" ");
        for (const v of client.vehicles) {
          if (v.sold) continue;
          const label = [v.make, v.model, v.plate].filter(Boolean).join(" ") || "Véhicule";
          vehicleRows.push({ id: v.id, label, ownerLabel });
        }
      }
      setRows(vehicleRows);
      setSelected(new Set(vehicleRows.map((r) => r.id)));
      setLoading(false);
    });
  }, []);

  useScrollRestoration(!loading);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  async function handleExport() {
    const targets = rows.filter((r) => selected.has(r.id));
    if (targets.length === 0) return;
    setGenerating(true);
    setProgress(0);

    const zip = new JSZip();
    const usedNames = new Set<string>();

    for (let i = 0; i < targets.length; i++) {
      const row = targets[i];
      const url = `${window.location.origin}/vehicule/${row.id}`;
      const dataUrl = await generateBrandedQr(url, color);
      const base64 = dataUrl.split(",")[1];

      const base = `qr-${slugifyForFilename(`${row.ownerLabel}-${row.label}`)}`;
      let filename = `${base}.png`;
      let n = 2;
      while (usedNames.has(filename)) {
        filename = `${base}-${n}.png`;
        n++;
      }
      usedNames.add(filename);
      zip.file(filename, base64, { base64: true });
      setProgress(i + 1);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-codes-cam-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    setGenerating(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Export des QR codes</h1>
      <p className="text-sm text-gray-400 mb-6">
        Sélectionne les véhicules à inclure, choisis une couleur, puis télécharge un fichier ZIP avec tous les QR
        codes en haute résolution — prêt à envoyer à un imprimeur (autocollants, porte-clés...). Les véhicules
        vendus (sans accès QR) ne sont pas listés.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun véhicule actif.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <button onClick={toggleAll} className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer">
              {selected.size === rows.length ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Couleur :</span>
              {QR_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                    color === c.hex ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="border border-gray-700 rounded-xl divide-y divide-gray-800 mb-4 max-h-[60vh] overflow-y-auto">
            {rows.map((row) => (
              <label
                key={row.id}
                className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-800/50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(row.id)}
                  onChange={() => toggle(row.id)}
                  className="accent-amber-500"
                />
                <span className="text-white">{row.label}</span>
                <span className="text-gray-500 text-xs">{row.ownerLabel}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={generating || selected.size === 0}
            className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold disabled:opacity-50 cursor-pointer"
          >
            {generating ? `Génération... (${progress}/${selected.size})` : `Télécharger le ZIP (${selected.size})`}
          </button>
        </>
      )}
    </div>
  );
}
