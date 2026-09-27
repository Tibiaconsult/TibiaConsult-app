// LootSplit como app separado precisa de um endereço próprio: no endereço do site, o app do TibiaConsult (escopo "/")
// já cobre /lootsplit, e o navegador oferece abrir o app principal em vez de instalar o LootSplit.
// O domínio abaixo é adicionado no Vercel (Settings → Domains) e aponta para o mesmo projeto; o proxy reconhece o host.

export const LOOTSPLIT_APP_URL = "https://lootsplit-tibiaconsult.vercel.app";
export const MAIN_SITE_URL = "https://tibia-consult-app.vercel.app";

/** Host do app do LootSplit (lootsplit-*.vercel.app ou lootsplit.<domínio>). */
export const isLootSplitHost = (host: string | null | undefined) => /^lootsplit[.-]/i.test(host ?? "");
