import { listAccounts } from "@/services/finance/accounts";
import { listCategories } from "@/services/finance/categories";
import ImportWizard from "./ImportWizard";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const [accounts, categories] = await Promise.all([listAccounts(), listCategories()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Importer un CSV bancaire</h1>
      <ImportWizard
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, scope: a.scope }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name, scope: c.scope }))}
      />
    </div>
  );
}
