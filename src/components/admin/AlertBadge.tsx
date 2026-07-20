import type { AlertStatus } from "@/services/admin/maintenanceAlerts";

const STYLES: Record<AlertStatus, string> = {
  overdue: "bg-red-600/20 border-red-600/50 text-red-400",
  soon: "bg-orange-600/20 border-orange-600/50 text-orange-400",
  ok: "bg-green-600/20 border-green-600/50 text-green-400",
  unknown: "bg-gray-600/20 border-gray-600/50 text-gray-400",
  sold: "bg-blue-600/20 border-blue-600/50 text-blue-400",
};

const LABELS: Record<AlertStatus, string> = {
  overdue: "Dépassé",
  soon: "Bientôt",
  ok: "À jour",
  unknown: "Inconnu",
  sold: "Vendu",
};

interface AlertBadgeProps {
  status: AlertStatus;
  children?: React.ReactNode;
}

export default function AlertBadge({ status, children }: AlertBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded border ${STYLES[status]}`}
    >
      {children ?? LABELS[status]}
    </span>
  );
}
