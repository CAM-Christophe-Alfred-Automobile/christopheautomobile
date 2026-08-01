import FinanceNavLinks from "@/components/admin/finance/FinanceNavLinks";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-800 pb-2">
        <FinanceNavLinks />
      </div>
      {children}
    </div>
  );
}
