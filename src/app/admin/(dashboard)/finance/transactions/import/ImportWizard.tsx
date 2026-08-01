"use client";

import { useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { guessColumnMapping, type ColumnMapping, type ParsedImportRow } from "@/lib/finance/csvParsing";
import { previewImportAction, commitImportAction, parsePdfAction, commitPdfImportAction, type PdfStatementType } from "./actions";

type AccountOption = { id: string; name: string; scope: string };
type CategoryOption = { id: string; name: string; scope: string };

type FileType = "csv" | "pdf";
type Step = "upload" | "mapping" | "preview" | "done";

const STATEMENT_TYPE_LABELS: Record<PdfStatementType, string> = {
  courant: "Compte courant / Perso (Revolut)",
  pro: "Compte Pro (Revolut)",
  joint: "Compte joint (Revolut)",
  nickel: "Compte Nickel",
};

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default function ImportWizard({
  accounts,
  categories,
}: {
  accounts: AccountOption[];
  categories: CategoryOption[];
}) {
  const [fileType, setFileType] = useState<FileType>("pdf");
  const [step, setStep] = useState<Step>("upload");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedImportRow[]>([]);
  const [statementType, setStatementType] = useState<PdfStatementType | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [errors, setErrors] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  function handleCsvFile(file: File) {
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        setHeaders(fields);
        setRawRows(results.data);
        setMapping(guessColumnMapping(fields));
        setStep("mapping");
      },
    });
  }

  async function handlePdfFile(file: File) {
    setFileName(file.name);
    setPdfError(null);
    if (file.size > 15 * 1024 * 1024) {
      setPdfError(
        `Ce fichier fait ${(file.size / (1024 * 1024)).toFixed(1)} Mo, c'est trop volumineux (15 Mo max). Essaie de réexporter un relevé sur une période plus courte.`
      );
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("accountId", accountId);
      const { statementType: detected, rows } = await parsePdfAction(formData);
      setStatementType(detected);
      setPreviewRows(rows);
      setSelected(rows.map((r) => !r.isDuplicate));
      setStep("preview");
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Impossible de lire ce PDF.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMappingContinue() {
    if (!mapping || !accountId) return;
    setLoading(true);
    try {
      const { rows, errors } = await previewImportAction(accountId, rawRows, mapping);
      setPreviewRows(rows);
      setSelected(rows.map((r) => !r.isDuplicate));
      setErrors(errors);
      setStep("preview");
    } finally {
      setLoading(false);
    }
  }

  async function handleCommit() {
    setLoading(true);
    try {
      const rowsToImport = previewRows.filter((_, i) => selected[i]);
      const res =
        fileType === "pdf"
          ? await commitPdfImportAction({ accountId, fileName, rows: rowsToImport })
          : await commitImportAction({
              accountId,
              fileName,
              columnMapping: mapping!,
              categoryId: categoryId || null,
              rows: rowsToImport,
            });
      setResult(res);
      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  function updateRowCategory(index: number, newCategoryId: string) {
    setPreviewRows((prev) => prev.map((r, i) => (i === index ? { ...r, categoryId: newCategoryId || null } : r)));
  }

  if (step === "done" && result) {
    return (
      <div className="max-w-lg space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-emerald-400">Import terminé</h2>
        <p className="text-gray-300">
          {result.imported} transaction(s) importée(s)
          {result.skipped > 0 ? `, ${result.skipped} ignorée(s)` : ""}.
        </p>
        <Link href="/admin/finance/transactions" className="inline-block px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium">
          Voir les transactions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ol className="flex gap-2 text-xs text-gray-500">
        <li className={step === "upload" ? "text-emerald-400" : ""}>1. Fichier</li>
        <li>→</li>
        {fileType === "csv" && (
          <>
            <li className={step === "mapping" ? "text-emerald-400" : ""}>2. Colonnes</li>
            <li>→</li>
          </>
        )}
        <li className={step === "preview" ? "text-emerald-400" : ""}>{fileType === "csv" ? "3." : "2."} Aperçu</li>
      </ol>

      {step === "upload" && (
        <div className="max-w-lg space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Type de fichier</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFileType("pdf")}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  fileType === "pdf" ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : "border-gray-700 hover:bg-gray-800"
                }`}
              >
                PDF Revolut / Nickel
              </button>
              <button
                type="button"
                onClick={() => setFileType("csv")}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  fileType === "csv" ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : "border-gray-700 hover:bg-gray-800"
                }`}
              >
                CSV (autre banque)
              </button>
            </div>
            {fileType === "pdf" && (
              <p className="text-xs text-gray-500 mt-1.5">
                Déposez directement le relevé PDF téléchargé depuis Revolut ou Nickel — le type est détecté
                automatiquement, colonnes/catégories/doublons aussi.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Compte cible</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.scope})
                </option>
              ))}
            </select>
          </div>

          {pdfError && <p className="text-sm text-red-400">{pdfError}</p>}

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              {fileType === "pdf" ? "Relevé PDF" : "Fichier CSV (export bancaire)"}
            </label>
            <input
              type="file"
              accept={fileType === "pdf" ? ".pdf" : ".csv"}
              disabled={loading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (fileType === "pdf") handlePdfFile(file);
                else handleCsvFile(file);
              }}
              className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer disabled:opacity-50"
            />
            {loading && fileType === "pdf" && <p className="text-xs text-gray-500 mt-1.5">Lecture du PDF...</p>}
          </div>
        </div>
      )}

      {step === "mapping" && mapping && fileType === "csv" && (
        <div className="max-w-lg space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400">
            {rawRows.length} lignes détectées dans <span className="text-gray-200">{fileName}</span>. Vérifiez
            l&apos;association des colonnes.
          </p>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Colonne Date</label>
            <select
              value={mapping.date}
              onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Colonne Description</label>
            <select
              value={mapping.description}
              onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Format du montant</label>
            <select
              value={mapping.mode}
              onChange={(e) => {
                const mode = e.target.value as "single" | "debit_credit";
                setMapping(
                  mode === "single"
                    ? { mode: "single", date: mapping.date, description: mapping.description, amount: headers[0] ?? "" }
                    : { mode: "debit_credit", date: mapping.date, description: mapping.description, debit: headers[0] ?? "", credit: headers[0] ?? "" }
                );
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="single">Une seule colonne montant (signé)</option>
              <option value="debit_credit">Deux colonnes débit / crédit</option>
            </select>
          </div>

          {mapping.mode === "single" ? (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Colonne Montant</label>
              <select
                value={mapping.amount}
                onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Colonne Débit</label>
                <select
                  value={mapping.debit}
                  onChange={(e) => setMapping({ ...mapping, debit: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Colonne Crédit</label>
                <select
                  value={mapping.credit}
                  onChange={(e) => setMapping({ ...mapping, credit: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleMappingContinue}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-medium"
            >
              {loading ? "Analyse..." : "Continuer"}
            </button>
            <button onClick={() => setStep("upload")} className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
              Retour
            </button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="text-gray-400">
              {previewRows.length} lignes reconnues
              {errors > 0 ? `, ${errors} ignorées (format invalide)` : ""}. Les doublons probables sont
              pré-décochés.
              {fileType === "pdf" && statementType && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                  Relevé détecté : {STATEMENT_TYPE_LABELS[statementType]}
                </span>
              )}
            </p>
            {fileType === "csv" && (
              <div className="flex items-center gap-2">
                <label className="text-gray-300">Catégorie par défaut :</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1"
                >
                  <option value="">Aucune</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="border border-gray-800 rounded-xl overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400 text-left sticky top-0">
                <tr>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Description</th>
                  {fileType === "pdf" && <th className="px-3 py-2">Catégorie</th>}
                  <th className="px-3 py-2 text-right">Montant</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {previewRows.map((row, i) => (
                  <tr key={i} className={row.isDuplicate ? "opacity-50" : ""}>
                    <td className="px-3 py-1.5">
                      <input
                        type="checkbox"
                        checked={selected[i] ?? false}
                        onChange={(e) =>
                          setSelected((prev) => prev.map((v, idx) => (idx === i ? e.target.checked : v)))
                        }
                      />
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {new Intl.DateTimeFormat("fr-FR").format(new Date(row.date))}
                    </td>
                    <td className="px-3 py-1.5">{row.description}</td>
                    {fileType === "pdf" && (
                      <td className="px-3 py-1.5">
                        <select
                          value={row.categoryId ?? ""}
                          onChange={(e) => updateRowCategory(i, e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs"
                        >
                          <option value="">Aucune</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className={`px-3 py-1.5 text-right ${row.amount < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {formatEUR(row.amount)}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-500">
                      {row.isDuplicate ? "doublon probable" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCommit}
              disabled={loading || selected.every((v) => !v)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-medium"
            >
              {loading ? "Import..." : `Importer ${selected.filter(Boolean).length} transaction(s)`}
            </button>
            <button
              onClick={() => setStep(fileType === "csv" ? "mapping" : "upload")}
              className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800"
            >
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
