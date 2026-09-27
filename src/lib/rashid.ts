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
    sign: `Rashid, direto de ${rashidCity(g.created_at)}`,
  };
}
