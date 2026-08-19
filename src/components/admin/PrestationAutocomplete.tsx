"use client";

import { useMemo, useRef, useState } from "react";
import servicesData from "@/app/data/services.json";

// Liste des prestations proposées sur christopheautomobile.fr (tarifs), dédupliquée par nom —
// sert à suggérer une prestation existante pendant la saisie de "Ce qui a été fait", plutôt que
// de la retaper à la main à chaque fois.
const PRESTATIONS = Array.from(new Map(servicesData.map((s) => [s.service, s])).values());

const DIACRITICS_RE = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");

function normalize(s: string): string {
  return s.normalize("NFD").replace(DIACRITICS_RE, "").toLowerCase();
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className: string;
}

// Champ texte "Ce qui a été fait" avec suggestions des prestations du site public au fil de la
// saisie. Cliquer une suggestion l'ajoute au texte (après la dernière virgule) plutôt que de
// remplacer ce qui a déjà été écrit, pour permettre de cumuler plusieurs prestations.
export default function PrestationAutocomplete({ value, onChange, placeholder, required, className }: Props) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSegment = value.split(",").pop()?.trim() ?? "";

  const suggestions = useMemo(() => {
    if (currentSegment.length < 2) return [];
    const needle = normalize(currentSegment);
    return PRESTATIONS.filter((s) => normalize(s.service).includes(needle)).slice(0, 8);
  }, [currentSegment]);

  function applySuggestion(serviceName: string) {
    const lastComma = value.lastIndexOf(",");
    const prefix = lastComma === -1 ? "" : `${value.slice(0, lastComma + 1)} `;
    onChange(`${prefix}${serviceName}`);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        required={required}
        className={className}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-sm">
          {suggestions.map((s) => (
            <li key={s.service}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySuggestion(s.service)}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-700 cursor-pointer"
              >
                <span className="text-gray-200">{s.service}</span>
                <span className="text-gray-500 text-xs ml-2">{s.categorie}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
