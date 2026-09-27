// Rashid: cidade de cada dia (muda no server save) e o jeito dele de espalhar fofoca.
// Cidades: TibiaWiki, Rashid (consulta em 26/09/2026).

export const RASHID_PLACES: Record<number, { city: string; where: string }> = {
  1: { city: "Svargrond", where: "taverna do Dankwart, ao sul do templo" },
  2: { city: "Liberty Bay", where: "taverna do Lyonel, a oeste do depot" },
  3: { city: "Port Hope", where: "taverna do Clyde, a oeste do depot" },
  4: { city: "Ankrahmun", where: "taverna do Arito, acima do correio" },
  5: { city: "Darashia", where: "taverna da Miraia, ao sul das guildhalls" },
  6: { city: "Edron", where: "taverna da Mirabell, acima do depot" },
  0: { city: "Carlin", where: "depot, um andar acima" },
};

/** Dia da semana do Tibia: horário de Berlim menos 10 horas (server save). */
export function tibiaWeekday(when: Date): number {
  const berlin = new Date(when.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  berlin.setHours(berlin.getHours() - 10);
  return berlin.getDay();
}

export const rashidCity = (iso: string) => RASHID_PLACES[tibiaWeekday(new Date(iso))].city;

function hash(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const OPEN = [
  "Psiu, chega mais...",
  "Olha, eu não sou de fofoca, mas...",
  "Não fui eu que te contei, hein.",
  "Fiquei sabendo de uma no depot...",
  "Segura essa, que nem eu acreditei:",
  "Sabe aquela morte ali? Então...",
  "Um passarinho de Thais me contou...",
];
const MIDDLE = [
  (who: string, body: string) => `Sobre ${who}, me contaram: “${body}”.`,
  (who: string, body: string) => `O caso de ${who}? Dizem que: “${body}”.`,
  (who: string, body: string) => `De ${who}, a boca miúda conta: “${body}”.`,
  (who: string, body: string) => `Fonte segura sobre ${who}: “${body}”.`,
];
const CLOSE = [
  "Não espalha. Espalha.",
  "Eu vendo essa informação por 10k. Pra você, de graça.",
  "Tô indo pra outra cidade antes que ele me ache.",
  "Depois reclamam que eu cobro caro nas coisas.",
  "Fonte: confia.",
  "Isso fica entre nós e a guilda inteira.",
  "Se perguntarem, eu estava vendendo tapete.",
];

/** Monta a fofoca na voz do Rashid. Mesma fofoca, mesmo texto (escolhas pelo id). */
export function gossipLines(g: { id: string; about: string; body: string; created_at: string }) {
  const h = hash(g.id);
  const body = g.body.trim().replace(/[.!]+$/, "");
  return {
    open: OPEN[h % OPEN.length],
    text: MIDDLE[(h >> 3) % MIDDLE.length](g.about, body),
    close: CLOSE[(h >> 5) % CLOSE.length],
    sign: `Rashid, direto de ${rashidCity(g.created_at)} · alguém me contou`,
  };
}

// ---------------------------------------------------------------- boatos inventados pelo Rashid
// Para toda morte do mural o Rashid inventa um boato (sempre o mesmo para a mesma morte). É zoeira declarada:
// a assinatura diz "boato não confirmado". Nada de ofensa pessoal: a piada é sempre com a morte.

export interface RumorDeath {
  name: string;
  died_at: string;
  level: number | null;
  reason: string | null;
  by_player: boolean;
}

const WEAK =
  /^(rat|cave rat|rotworm|troll|wasp|bug|snake|spider|chicken|sheep|deer|rabbit|pig|dog|wolf|bat|frog|orc|goblin|skeleton|mushroom|squirrel|cat|poison spider|larva|scarab)$/i;
const FLOOR = /\b(field|trap|explosion|drown|drowning)\b/i;

/** Quem matou: o primeiro da lista que não seja o próprio char. */
export function killersOf(d: RumorDeath): string[] {
  const after = (d.reason ?? "").replace(/^.*?\bby\b\s*/i, "").replace(/\.$/, "");
  return after
    .split(/,\s*|\s+and\s+/)
    .map((k) => k.trim().replace(/^(a|an|the)\s+/i, ""))
    .filter((k) => k && k.toLowerCase() !== d.name.toLowerCase());
}

type T = (n: string, k: string, l: string, c: number) => string;

const GENERIC: T[] = [
  (n, k) => `${n} morreu pra ${k} e botou a culpa na internet. A internet mandou dizer que estava ótima.`,
  (n, k) => `${n} jura que foi lag. O ${k} jura que foi habilidade.`,
  (n, k) => `${n} estava respondendo mensagem no celular quando o ${k} chegou. A mensagem foi entregue, o char não.`,
  (n, k, l) => `o ${k} pegou ${n} no level ${l} e agora cobra pedágio na hunt.`,
  (n) => `${n} disse que estava testando a Wheel nova. A Wheel reprovou.`,
  (n, k) => `${n} foi buscar um café e deixou o char no respawn do ${k}. O café estava bom, pelo menos.`,
  (n) => `${n} culpou o blocker. Detalhe: estava caçando sozinho.`,
  (n) => `${n} garante que apertou a potion. A potion garante que não.`,
  (n, k) => `${n} estava de olho no Market em vez da barra de vida. O ${k} agradece.`,
  (n) => `${n} foi pro templo tão rápido que achei que era teleporte novo.`,
  (n) => `${n} jurou que era só mais uma box. Foi a última mesmo.`,
  (n, k) => `o gato de ${n} pisou no teclado bem na hora do ${k}. É o que dizem, pelo menos.`,
  (n, _k, l) => `${n} perdeu o level ${l} e a dignidade. A dignidade não volta com bless.`,
  (n, k) => `${n} estava com o exura na hotkey errada. Curou o ${k}.`,
  (n) => `${n} disse que a luz caiu. A conta de luz está em dia, a da bless nem tanto.`,
  (n, k) => `${n} diz que o ${k} estava bugado. O ${k} diz que ${n} estava de chinelo.`,
  (n) => `${n} estava explicando pra party como não morrer. Didática impecável, execução nem tanto.`,
  (n, k) => `${n} tentou fazer amizade com o ${k}. O ${k} não aceitou o convite.`,
  (n) => `${n} desligou o som pra ouvir o jogo melhor. Ouviu o próprio grito no templo.`,
  (n, k) => `${n} viu o ${k} e pensou "esse eu aguento". Não aguentava.`,
  (n) => `${n} estava gravando vídeo pra ensinar a hunt. O vídeo vai virar meme.`,
  (n, k) => `${n} jura que o ${k} veio de lado. O ${k} jura que veio de frente, sorrindo.`,
  (n) => `${n} estava sem bless e com fé. A fé não protege item.`,
  (n, _k, l) => `${n} ia upar pro ${Number(l) + 1 || "próximo"} hoje. Hoje não, amanhã talvez.`,
  (n) => `${n} foi sem SSA porque "é só uma passadinha". Foi mesmo.`,
  (n) => `${n} deixou o might ring no depot pra não gastar carga. Economizou o anel, gastou o level.`,
  (n, k) => `${n} jura que a mãe chamou pra jantar bem na hora do ${k}. A janta estava ótima.`,
  (n) => `${n} foi fazer xixi rapidinho e deixou o char no respawn. Voltou aliviado e sem level.`,
  (n, k) => `${n} saiu da hunt pra atender o interfone e o ${k} atendeu o ${n}.`,
  (n) => `${n} disse que a hotkey mudou sozinha. As hotkeys negam.`,
  (n) => `${n} usou o mouse com duplo clique fantasma. O clique foi pro templo.`,
  (n) => `${n} estava tão focado no loot que esqueceu que tinha barra de vida.`,
  (n) => `${n} foi checar o preço do char no Bazaar. Agora o char vale menos.`,
  (n, _k, l) => `${n} caiu do level ${l} e já está pensando em voltar pra Rookgaard, onde era feliz.`,
  (n) => `${n} tinha 3 potions na backpack e fé no coração. Faltou fé.`,
  (n) => `${n} achou que o server save era às 11 e o respawn achou que era agora.`,
  (n, k) => `${n} pediu "segura aí rapidinho" pro blocker. O blocker segurou. O ${k} também.`,
  (n) => `${n} estava comendo e jogando com uma mão só. A mão errada.`,
  (n) => `${n} desceu a escada certa, no andar errado, na hora errada.`,
  (n) => `${n} usou o utito tempo na hora que precisava de utamo. Coragem demais, mana de menos.`,
  (n, k) => `${n} gritou "exura" no chat do Default em vez de apertar a hotkey. O ${k} leu e riu.`,
  (n) => `${n} disse que ia só terminar a task. A task terminou ${n}.`,
  (n) => `${n} dormiu no teclado com o char na hunt. Acordou no templo com a marca do F4 na testa.`,
  (n, k) => `${n} tentou fugir do ${k} pela escada. A escada estava do outro lado do mapa.`,
  (n) => `${n} deixou o char no offline training... ah não, era a hunt mesmo.`,
  (n) => `${n} foi olhar o Discord da guilda no meio da hunt. A guilda viu primeiro no mural.`,
  (n) => `${n} garante que a internet caiu. O Discord dele ficou online o tempo todo.`,
  (n) => `${n} esqueceu de renovar o imbuement. O imbuement lembrou de ${n}.`,
  (n) => `${n} estava sem amulet of loss e com muita esperança. A esperança não é item.`,
  (n, k) => `${n} desafiou o ${k} pra um x1. Perdeu no x1.`,
  (n, k) => `a esposa de ${n} cansou de esperar e puxou o PC da tomada. O ${k} agradece a colaboração.`,
  (n) => `a esposa de ${n} avisou três vezes que o jantar estava pronto. Na quarta, desligou o PC da tomada.`,
  (n) => `${n} prometeu pra esposa que era "só mais uma hunt". A esposa cumpriu a promessa por ele: tirou o PC da tomada.`,
  (n, k) => `${n} pediu cinco minutinhos pra esposa. Ela deu dois, e o ${k} usou os outros três.`,
  (n) => `a sogra de ${n} chegou de surpresa e alguém precisou ir abrir o portão. O char ficou sozinho no respawn.`,
  (n) => `${n} foi caçar em Thais. Eu nunca vou a Thais, lá não é seguro. Taí a prova.`,
  (n) => `${n} se perdeu nos túneis de Kazordoon, igual a mim. A diferença é que eu não morro, só reclamo.`,
  (n) => `${n} disse que os elfos de Ab'Dendriel eram gente boa. Eu sempre avisei: conversa de abraçar árvore esconde alguma coisa.`,
  (n) => `${n} achou que Venore era lugar de fazer negócio. É lugar de concorrência. Com a morte, inclusive.`,
  (n) => `eu não compro de qualquer um, e o respawn também não aceita qualquer um. ${n} foi recusado.`,
  (n) => `${n} me chamou de "old friend" e pediu desconto. Não dei. Aí foi caçar sem pot.`,
];

const PVP: T[] = [
  (n, k) => `${n} levou PK de ${k} e já está criando um char de vingança. Level 8, mas com muita raiva.`,
  (n, k) => `${n} foi tirar satisfação com ${k} e voltou pro templo sem satisfação e sem level.`,
  (n, k) => `${n} xingou ${k} no Default. ${k} respondeu com runa.`,
  (n, k) => `${n} jura que ${k} estava de bot. ${k} jura que ${n} estava de bobeira.`,
  (n, k) => `${n} e ${k} tinham uma treta antiga. Agora a treta tem placar.`,
  (n) => `${n} achou que o skull era enfeite. Não era.`,
  (n, k) => `${n} chamou ${k} de noob no Advertising. ${k} respondeu com um tutorial ao vivo.`,
  (n, k) => `${n} jura que ${k} tinha 5 chars no party. Tinha 1, mas era bom.`,
  (n, k) => `${n} tentou dar exiva em ${k}. ${k} deu exori em ${n}.`,
  (n) => `${n} saiu do PZ pra "só olhar". Olhou de perto demais.`,
  (n, k) => `${n} ia denunciar ${k} por bot. Primeiro vai ter que sair do templo.`,
  (n, k) => `${n} e ${k} vão resolver isso na DM do Instagram, igual gente grande.`,
];

const MANY: T[] = [
  (n) => `${n} puxou o respawn inteiro achando que era evento de XP dobrada.`,
  (n) => `${n} chamou a festa toda e esqueceu que era o convidado principal.`,
  (n, _k, _l, c) => `contaram ${c} creatures em cima de ${n}. Eu parei de contar no terceiro.`,
  (n) => `${n} fez um lure tão grande que o servidor pediu calma.`,
  (n) => `${n} falou "só mais uma creature" umas sete vezes seguidas.`,
  (n) => `${n} achou que era um lure. Era uma excursão.`,
  (n) => `${n} puxou tanta creature que o respawn ao lado ficou vazio e reclamou.`,
  (n, _k, _l, c) => `${c} contra 1. ${n} gosta de desafio, não de viver.`,
  (n) => `${n} disse "vem, vem, vem" até que veio tudo.`,
];

const FIELD: T[] = [
  (n) => `${n} perdeu uma briga para o chão. O chão segue invicto.`,
  (n) => `${n} pisou onde não devia. Pelo visto, a vida toda.`,
  (n) => `nem monstro precisou: ${n} resolveu sozinho com o piso.`,
  (n) => `${n} achou que o field era decoração. Decoração cara.`,
  (n) => `${n} escorregou no chão e caiu na lista de mortes.`,
  (n) => `o chão fez ${n} de otário. O chão, gente.`,
  (n) => `${n} achou que o fogo era só visual. Era bem real.`,
];

const WEAKK: T[] = [
  (n, k, l) => `${n} morreu pra ${k}. Isso mesmo, ${k}. No level ${l}. Não tenho mais nada a dizer.`,
  (n, k) => `${n} subestimou o ${k}. O ${k} não subestimou ${n}.`,
  (n, k) => `os ${k}s da região estão comemorando desde ontem por causa de ${n}.`,
  (n, k) => `o ${k} que matou ${n} já está pedindo autógrafo no depot.`,
  (n, k) => `${n} voltou pra Rookgaard em espírito: morreu pra ${k}.`,
  (n, k) => `o ${k} contou pros amigos que derrubou ${n}. Ninguém acreditou até ver o mural.`,
  (n, k) => `${n} está dizendo que era um ${k} "diferente". Era um ${k} normal.`,
];

const BOSS: T[] = [
  (n, k) => `${n} foi visitar ${k} sem marcar horário. Foi recebido do jeito de ${k}.`,
  (n, k) => `${n} achou que dava pra fazer ${k} de chinelo. Não dava.`,
  (n, k) => `${k} mandou avisar que ${n} pode voltar quando quiser. Adorou a visita.`,
  (n, k) => `${n} entrou na sala de ${k} falando "é rapidinho". Foi mesmo.`,
  (n, k) => `${n} leu o guia de ${k} no TikTok. Faltou a parte 2.`,
  (n, k) => `${k} agradece a ${n} pela doação de level. Volte sempre.`,
  (n, k) => `${n} jurou que ia pegar o drop raro de ${k}. ${k} pegou o drop raro de ${n}.`,
];

const RUMOR_OPEN = [
  "Psiu, chega mais...",
  "Fiquei sabendo que",
  "Olha, eu não sou de fofoca, mas",
  "Um passarinho de Thais me contou que",
  "Tá todo mundo comentando no depot que",
  "Segura essa:",
  "Boato quentinho do depot:",
  "Não fui eu que te contei, mas",
  "Me contaram no barco de Venore que",
  "O Djinn azul me sussurrou que",
  "Enquanto eu vendia um tapete, ouvi que",
  "O guarda da ponte de Thais jura que",
  "Tá rolando no Advertising que",
];

const RUMOR_CLOSE = [
  "Não espalha. Espalha.",
  "Mas você não ouviu isso de mim.",
  "Fonte: um NPC muito confiável (eu).",
  "Eu vendo essa informação por 10k. Pra você, de graça.",
  "Tô indo pra outra cidade antes que ele me ache.",
  "Isso fica entre nós e a guilda inteira.",
  "Se perguntarem, eu estava vendendo tapete.",
  "Depois reclamam que eu cobro caro nas coisas.",
  "A bless era mais barata que o drama.",
  "Aceito F no pix.",
  "Amanhã tem mais, sempre tem.",
  "Não fui eu que postei, fui só eu que espalhei.",
  "Pra saber o resto, compra algo na minha loja.",
  "O Henricus já está separando as bless.",
];

// Opiniões do Rashid sobre as cidades (falas dele no jogo, TibiaWiki Rashid/Transcripts), viradas em P.S. da fofoca
const CITY_PS: Record<string, ((n: string) => string)[]> = {
  Svargrond: [
    (n) => `Aqui em Svargrond, com um hidromel bárbaro no bucho, até a morte de ${n} fica mais aconchegante.`,
    () => `Queria que Svargrond fosse mais quentinho. Mais quente que essa fofoca, impossível.`,
  ],
  "Liberty Bay": [
    (n) => `Liberty Bay é linda, se você evita a favela. ${n} devia ter evitado o respawn também.`,
    () => `A filha do governador de Liberty Bay é mais bonita que essa morte. Bem mais.`,
  ],
  "Port Hope": [
    () => `Eu não ponho o pé na selva de Port Hope. Já viu o tamanho das centopeias?`,
    (n) => `Gosto de Port Hope, mas só do povoado. A selva eu deixo pra gente como ${n}.`,
  ],
  Ankrahmun: [
    (n) => `Ah, Ankrahmun, minha terra! Pirâmides perfeitas. Bem diferente da estratégia de ${n}.`,
    () => `O cheiro da areia do deserto de Ankrahmun... bem melhor que o cheiro dessa hunt.`,
  ],
  Darashia: [
    (n) => `Os mercadores de Darashia cobram preços ridículos. A bless do ${n} também não saiu barata.`,
    () => `Darashia não é o deserto de verdade, mas quase. Igual a essa desculpa: quase convence.`,
  ],
  Edron: [
    (n) => `Edron é uma ilha tão tranquila... era, até chegar a notícia de ${n}.`,
    () => `Em Edron eu sempre faço bons negócios. Essa fofoca, por exemplo, já vendi três vezes.`,
  ],
  Carlin: [
    () => `A rainha de Carlin me chama pra ver minhas mercadorias. Essa morte eu não mostro pra ela, é feia demais.`,
    () => `Reis, rainhas, califas... todo mundo diz que é diferente. No templo, é tudo igual.`,
  ],
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** O boato inventado pelo Rashid para uma morte (sempre o mesmo para a mesma morte). */
export function rashidRumor(d: RumorDeath) {
  const h = hash(d.name.toLowerCase() + d.died_at);
  const killers = killersOf(d);
  const k = killers[0] ?? "destino";
  const l = String(d.level ?? "?");
  let pool: T[] = GENERIC;
  // o próprio char na lista (dano refletido etc.) faz o TibiaData marcar PvP sem ter outro jogador
  const selfKill = (d.reason ?? "").toLowerCase().includes(`by ${d.name.toLowerCase()}`);
  if (d.by_player && !selfKill && killers.length) pool = PVP;
  else if (killers.length >= 4) pool = MANY;
  else if (FLOOR.test(k)) pool = FIELD;
  else if (WEAK.test(k)) pool = WEAKK;
  else if (/^[A-Z]/.test(k) && (!d.by_player || selfKill)) pool = BOSS;
  const open = RUMOR_OPEN[h % RUMOR_OPEN.length];
  const body = pool[(h >> 3) % pool.length](d.name, k, l, killers.length);
  // "Fiquei sabendo que" pede a frase em minúscula; "Segura essa:" pede maiúscula
  const text = /(que|mas)$/.test(open) ? `${open} ${body}` : `${open} ${cap(body)}`;
  const city = rashidCity(d.died_at);
  const ps = h % 3 === 1 ? CITY_PS[city]?.[(h >> 9) % CITY_PS[city].length]?.(d.name) : undefined;
  return { text, close: RUMOR_CLOSE[(h >> 6) % RUMOR_CLOSE.length], ps, sign: `Rashid, direto de ${city} · boato não confirmado` };
}
