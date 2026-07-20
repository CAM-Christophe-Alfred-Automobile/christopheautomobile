import Link from "next/link";
import StockPartForm from "@/components/admin/StockPartForm";

export default function NouvellePiecePage() {
  return (
    <div className="space-y-4">
      <Link href="/admin/stock" className="text-sm text-gray-500 hover:text-white">
        ← Retour au stock
      </Link>
      <h1 className="text-2xl font-semibold">Nouvelle pièce</h1>
      <StockPartForm mode="create" />
    </div>
  );
}
