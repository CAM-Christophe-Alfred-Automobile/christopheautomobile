import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccount } from "@/services/finance/accounts";
import { ENABLEBANKING_APP_ID, ENABLEBANKING_PRIVATE_KEY_BASE64, ENABLEBANKING_REDIRECT_URI } from "@/config/financeBanking";
import { listAspsps, EnableBankingApiError } from "@/lib/finance/enableBankingClient";
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

  let aspsps;
  try {
    aspsps = await listAspsps();
  } catch (error) {
    // "Application is not active" (403) : l'appli Enable Banking doit d'abord être activée
    // en liant son propre compte directement dans leur Control Panel (mode restreint/gratuit),
    // avant que l'API n'accepte les appels — sinon l'erreur brute faisait planter toute la page.
    const isNotActive =
      error instanceof EnableBankingApiError &&
      error.status === 403 &&
      typeof error.body === "object" &&
      error.body !== null &&
      "message" in error.body &&
      String((error.body as { message?: unknown }).message).includes("not active");

    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-xl font-semibold">Connecter {account.name}</h1>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300">
          {isNotActive ? (
            <>
              L&apos;application Enable Banking n&apos;est pas encore activée. Va sur le{" "}
              <a
                href="https://enablebanking.com/cp/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Control Panel Enable Banking
              </a>
              , ouvre ton application et clique &quot;Activer en associant des comptes&quot; pour lier ton propre
              compte — reviens ici ensuite.
            </>
          ) : (
            <>Erreur de connexion à Enable Banking : {error instanceof Error ? error.message : "erreur inconnue"}.</>
          )}
        </div>
        <Link href="/admin/finance/accounts" className="text-sm text-gray-400 hover:text-white">
          ← Retour aux comptes
        </Link>
      </div>
    );
  }

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
