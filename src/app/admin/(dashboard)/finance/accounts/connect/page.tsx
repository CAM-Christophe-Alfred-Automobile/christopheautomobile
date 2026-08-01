import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccount } from "@/services/finance/accounts";
import { ENABLEBANKING_APP_ID, ENABLEBANKING_PRIVATE_KEY_BASE64, ENABLEBANKING_REDIRECT_URI } from "@/config/financeBanking";
import { listAspsps } from "@/lib/finance/enableBankingClient";
import BankPicker from "./BankPicker";

export default async function ConnectBankPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const { accountId } = await searchParams;
  if (!accountId) notFound();

  const account = await getAccount(accountId);
  if (!account) notFound();

  const isConfigured = Boolean(
    ENABLEBANKING_APP_ID && ENABLEBANKING_PRIVATE_KEY_BASE64 && ENABLEBANKING_REDIRECT_URI
  );

  if (!isConfigured) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-xl font-semibold">Connecter {account.name}</h1>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300">
          Enable Banking n&apos;est pas encore configuré (variables <code>ENABLEBANKING_*</code> manquantes dans{" "}
          <code>.env</code>). Créez un compte sur enablebanking.com, récupérez votre Application ID et votre clé
          privée, puis ajoutez-les au fichier <code>.env</code> avant de continuer.
        </div>
        <Link href="/admin/finance/accounts" className="text-sm text-gray-400 hover:text-white">
          ← Retour aux comptes
        </Link>
      </div>
    );
  }

  const aspsps = await listAspsps();

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Connecter {account.name}</h1>
      <p className="text-sm text-gray-400">
        Choisissez votre banque. Vous serez redirigé vers le site officiel de votre banque pour vous connecter — vos
        identifiants ne passent jamais par CAMfinance.
      </p>
      <BankPicker accountId={accountId} aspsps={aspsps} />
    </div>
  );
}
