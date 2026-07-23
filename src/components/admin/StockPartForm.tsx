"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Consommables",
  "Moteur",
  "Freinage",
  "Suspension",
  "Carrosserie",
  "Électrique",
  "Échappement",
  "Transmission",
  "Intérieur",
  "Autre",
];

const CONDITIONS = ["Neuf", "Bon état", "Usé", "Hors service"];

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white " +
  "placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors";

interface StockPhoto {
  id: string;
  url: string;
}

interface StockPart {
  id: string;
  name: string;
  reference: string | null;
  category: string | null;
  quantity: number;
  location: string | null;
  condition: string | null;
  notes: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYears: string | null;
  aiSummary: string | null;
  photos: StockPhoto[];
}

interface IdentifyCandidate {
  make: string;
  model?: string;
  years?: string;
  confidence: number;
  reasoning: string;
}

interface IdentifyResult {
  part_name: string;
  reference_visible?: string;
  category?: string;
  candidates: IdentifyCandidate[];
  notes?: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Les photos prises au téléphone (plusieurs Mo) dépassent la limite de taille
// des requêtes du serveur. On les redimensionne/compresse avant tout envoi.
async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  try {
    const dataUrl = await fileToDataUrl(file);
    const img = await loadImage(dataUrl);
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), 8000);
      canvas.toBlob(
        (b) => {
          clearTimeout(timer);
          resolve(b);
        },
        "image/jpeg",
        quality
      );
    });
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

type Props = {
  mode: "create" | "edit";
  initialPart?: StockPart;
};

export default function StockPartForm({ mode, initialPart }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialPart?.name ?? "");
  const [reference, setReference] = useState(initialPart?.reference ?? "");
  const [category, setCategory] = useState(initialPart?.category ?? "");
  const [quantity, setQuantity] = useState(String(initialPart?.quantity ?? 1));
  const [location, setLocation] = useState(initialPart?.location ?? "");
  const [condition, setCondition] = useState(initialPart?.condition ?? "");
  const [notes, setNotes] = useState(initialPart?.notes ?? "");
  const [vehicleMake, setVehicleMake] = useState(initialPart?.vehicleMake ?? "");
  const [vehicleModel, setVehicleModel] = useState(initialPart?.vehicleModel ?? "");
  const [vehicleYears, setVehicleYears] = useState(initialPart?.vehicleYears ?? "");
  const [aiSummary, setAiSummary] = useState(initialPart?.aiSummary ?? "");

  const [existingPhotos, setExistingPhotos] = useState(initialPart?.photos ?? []);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);

  const [identifying, setIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  const [identifyResult, setIdentifyResult] = useState<IdentifyResult | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPhotosSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      setNewPhotoPreviews((prev) => [...prev, url]);
    });

    setCompressing(true);
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      setNewPhotos((prev) => [...prev, ...compressed]);
    } finally {
      setCompressing(false);
    }
  }

  function removeNewPhoto(index: number) {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function removeExistingPhoto(photo: StockPhoto) {
    if (!initialPart) return;
    if (!confirm("Supprimer cette photo ?")) return;
    const res = await fetch(`/api/admin/stock/${initialPart.id}/photos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: photo.id, url: photo.url }),
    });
    if (res.ok) {
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }
  }

  async function handleIdentify() {
    setIdentifying(true);
    setIdentifyError(null);
    setIdentifyResult(null);
    try {
      const images = await Promise.all(newPhotos.map(fileToDataUrl));
      const res = await fetch("/api/admin/stock/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, text: notes }),
      });
      const data = await res.json();
      if (!data.success) {
        setIdentifyError(data.error ?? "Erreur lors de l'identification.");
        return;
      }
      setIdentifyResult(data.result as IdentifyResult);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setIdentifyError(`Impossible de contacter le service d'identification. (${detail})`);
    } finally {
      setIdentifying(false);
    }
  }

  function applyCandidate(candidate: IdentifyCandidate) {
    if (!identifyResult) return;
    setName((prev) => prev || identifyResult.part_name);
    setReference((prev) => prev || identifyResult.reference_visible || "");
    setCategory((prev) => prev || identifyResult.category || "");
    setVehicleMake(candidate.make);
    setVehicleModel(candidate.model ?? "");
    setVehicleYears(candidate.years ?? "");
    const summaryLines = [
      `Pièce: ${identifyResult.part_name}`,
      `Véhicule retenu: ${candidate.make} ${candidate.model ?? ""} ${candidate.years ?? ""} (confiance ${Math.round(candidate.confidence * 100)}%)`,
      `Raisonnement: ${candidate.reasoning}`,
      identifyResult.notes ? `Remarques IA: ${identifyResult.notes}` : "",
    ].filter(Boolean);
    setAiSummary(summaryLines.join("\n"));
  }

  async function uploadNewPhotos(partId: string) {
    for (const file of newPhotos) {
      const fd = new FormData();
      fd.append("file", file);
      await fetch(`/api/admin/stock/${partId}/photos`, { method: "POST", body: fd });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom de la pièce est obligatoire.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      name,
      reference: reference || null,
      category: category || null,
      quantity: quantity ? Number(quantity) : 1,
      location: location || null,
      condition: condition || null,
      notes: notes || null,
      vehicleMake: vehicleMake || null,
      vehicleModel: vehicleModel || null,
      vehicleYears: vehicleYears || null,
      aiSummary: aiSummary || null,
    };

    try {
      const url = mode === "create" ? "/api/admin/stock" : `/api/admin/stock/${initialPart!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      const id = mode === "create" ? data.part.id : initialPart!.id;
      if (newPhotos.length > 0) await uploadNewPhotos(id);
      router.push(`/admin/stock/${id}`);
      router.refresh();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setError(`Impossible de contacter le serveur. (${detail})`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialPart) return;
    if (!confirm(`Supprimer définitivement "${initialPart.name}" ?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/stock/${initialPart.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/stock");
      router.refresh();
    } else {
      setDeleting(false);
      setError("Impossible de supprimer cette pièce.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-300">Photos</h2>
        <div className="flex flex-wrap gap-3">
          {existingPhotos.map((photo) => (
            <div key={photo.id} className="relative w-20 h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-700" />
              <button
                type="button"
                onClick={() => removeExistingPhoto(photo)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs leading-5 cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          {newPhotoPreviews.map((url, i) => (
            <div key={url} className="relative w-20 h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-700" />
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs leading-5 cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          <label className="w-20 h-20 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-700 cursor-pointer text-xs text-center text-gray-500 hover:border-amber-500 hover:text-amber-400">
            + Photo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={onPhotosSelected}
            />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleIdentify}
            disabled={identifying || compressing || (newPhotos.length === 0 && !notes.trim())}
            className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold disabled:opacity-40 cursor-pointer"
          >
            {identifying ? "Identification en cours…" : compressing ? "Préparation des photos…" : "🔍 Identifier avec l'IA"}
          </button>
          <span className="text-xs text-gray-500">Basé sur les nouvelles photos + la description ci-dessous</span>
        </div>

        {identifyError && <p className="text-sm text-red-400">{identifyError}</p>}

        {identifyResult && (
          <div className="rounded-lg border border-gray-700 p-4 space-y-3 bg-gray-800/50">
            <p className="text-sm text-gray-300">
              <strong>Pièce probable :</strong> {identifyResult.part_name}
              {identifyResult.reference_visible && ` — réf. visible: ${identifyResult.reference_visible}`}
            </p>
            <div className="space-y-2">
              {identifyResult.candidates.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-lg border border-gray-700 p-3"
                >
                  <div className="text-sm">
                    <p className="font-medium text-white">
                      {c.make} {c.model} {c.years}{" "}
                      <span className="text-gray-500">({Math.round(c.confidence * 100)}%)</span>
                    </p>
                    <p className="text-gray-400">{c.reasoning}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyCandidate(c)}
                    className="shrink-0 px-3 py-1 rounded bg-amber-500 text-gray-900 text-xs font-semibold cursor-pointer"
                  >
                    Utiliser
                  </button>
                </div>
              ))}
            </div>
            {identifyResult.notes && <p className="text-xs italic text-gray-500">{identifyResult.notes}</p>}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-gray-300 sm:col-span-2">
          Nom de la pièce *
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Référence
          <input value={reference} onChange={(e) => setReference(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Catégorie
          <input list="categories" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
          <datalist id="categories">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Quantité
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300">
          État
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300 sm:col-span-2">
          Emplacement dans le garage
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="ex: Étagère A, bac 3"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300 sm:col-span-2">
          Description / notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Détails visibles, texte gravé sur la pièce, etc. (utilisé aussi par l'IA)"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Marque véhicule
          <input value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Modèle véhicule
          <input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Années
          <input
            value={vehicleYears}
            onChange={(e) => setVehicleYears(e.target.value)}
            placeholder="ex: 2008-2013"
            className={inputClass}
          />
        </label>

        {aiSummary && (
          <label className="flex flex-col gap-1 text-sm text-gray-300 sm:col-span-2">
            Résumé IA (modifiable)
            <textarea
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              rows={4}
              className={`${inputClass} text-xs`}
            />
          </label>
        )}
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || compressing}
          className="px-5 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold disabled:opacity-40 cursor-pointer"
        >
          {saving
            ? "Enregistrement…"
            : compressing
              ? "Préparation des photos…"
              : mode === "create"
                ? "Enregistrer la pièce"
                : "Enregistrer les modifications"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-lg border border-red-600 text-red-400 text-sm disabled:opacity-40 cursor-pointer"
          >
            {deleting ? "Suppression…" : "Supprimer"}
          </button>
        )}
      </div>
    </form>
  );
}
