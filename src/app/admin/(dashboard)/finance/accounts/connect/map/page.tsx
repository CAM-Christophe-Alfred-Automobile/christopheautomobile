import { notFound } from "next/navigation";
import { verifyMappingToken } from "@/services/finance/bankSync";
import { listAccounts } from "@/services/finance/accounts";
import { mapExternalAccountsAction } from "./actions";

export default async function MapAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) notFound();

  const payload = await verifyMappingToken(token);
  if (!payload) notFound();

  const accounts = await listAccounts();

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Associer vos comptes {payload.aspspName}</h1>
      <p className="text-sm text-gray-400">
        Plusieurs comptes ont été trouvés. Choisissez à quel compte CAMfinance chacun correspond, ou laissez
        «&nbsp;Ignorer&nbsp;» pour ne pas le connecter.
      </p>

      <form action={mapExternalAccountsAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <input type="hidden" name="token" value={token} />
        {payload.accounts.map((extAccount) => (
          <div key={extAccount.uid}>
            <label className="block text-sm text-gray-300 mb-1">{extAccount.label}</label>
            <select
              name={`map_${extAccount.uid}`}
              defaultValue=""
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="">Ignorer</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.scope})
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium">
          Valider
        </button>
      </form>
    </div>
  );
}
