export type AlertStatus = "unknown" | "ok" | "soon" | "overdue" | "sold";

export interface MaintenanceAlert {
  status: AlertStatus;
  nextDueDate: Date | null;
  daysRemaining: number | null;
  nextDueKm?: number | null;
}

export interface KmContext {
  lastDoneMileage: number | null;
  intervalKm: number | null;
  currentMileage: number | null;
  soonThresholdKm?: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_SOON_THRESHOLD_DAYS = 30;

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

const DEFAULT_SOON_THRESHOLD_KM = 1000;

export function computeMaintenanceAlert(
  lastDoneDate: Date | null,
  intervalMonths: number | null,
  today: Date = new Date(),
  soonThresholdDays: number = DEFAULT_SOON_THRESHOLD_DAYS,
  km?: KmContext
): MaintenanceAlert {
  const dateAlert: MaintenanceAlert =
    !lastDoneDate || !intervalMonths
      ? { status: "unknown", nextDueDate: null, daysRemaining: null }
      : (() => {
          const nextDueDate = addMonths(lastDoneDate, intervalMonths);
          const daysRemaining = Math.round((nextDueDate.getTime() - today.getTime()) / MS_PER_DAY);
          const status: AlertStatus =
            daysRemaining < 0 ? "overdue" : daysRemaining <= soonThresholdDays ? "soon" : "ok";
          return { status, nextDueDate, daysRemaining };
        })();

  if (!km || !km.intervalKm || km.lastDoneMileage == null || km.currentMileage == null) {
    return dateAlert;
  }

  const nextDueKm = km.lastDoneMileage + km.intervalKm;
  const kmRemaining = nextDueKm - km.currentMileage;
  const soonThresholdKm = km.soonThresholdKm ?? DEFAULT_SOON_THRESHOLD_KM;
  const kmStatus: AlertStatus = kmRemaining < 0 ? "overdue" : kmRemaining <= soonThresholdKm ? "soon" : "ok";

  return {
    status: worstAlertStatus([dateAlert.status, kmStatus]),
    nextDueDate: dateAlert.nextDueDate,
    daysRemaining: dateAlert.daysRemaining,
    nextDueKm,
  };
}

const SEVERITY_ORDER: Record<AlertStatus, number> = {
  sold: -1,
  unknown: 0,
  ok: 1,
  soon: 2,
  overdue: 3,
};

export function worstAlertStatus(statuses: AlertStatus[]): AlertStatus {
  if (statuses.length === 0) return "unknown";
  return statuses.reduce((worst, current) =>
    SEVERITY_ORDER[current] > SEVERITY_ORDER[worst] ? current : worst
  );
}
