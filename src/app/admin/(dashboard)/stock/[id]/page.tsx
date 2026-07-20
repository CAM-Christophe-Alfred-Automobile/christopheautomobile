"use client";

import { use as usePromise, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import StockPartForm from "@/components/admin/StockPartForm";

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

export default function PieceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [part, setPart] = useState<StockPart | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/stock/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPart(d.part);
        else setNotFoundFlag(true);
        setLoading(false);
      });
  }, [id]);

  if (notFoundFlag) notFound();
  if (loading || !part) return <p className="text-gray-400 text-sm">Chargement...</p>;

  return (
    <div className="space-y-4">
      <Link href="/admin/stock" className="text-sm text-gray-500 hover:text-white">
        ← Retour au stock
      </Link>
      <h1 className="text-2xl font-semibold">{part.name}</h1>
      <StockPartForm mode="edit" initialPart={part} />
    </div>
  );
}
