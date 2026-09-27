// Henricus, o Lord Inquisitor de Thais (andar de baixo da cadeia), vende a Blessing of the Inquisition.
// Aqui ele comenta os melhores clientes do mês: quem mais morreu. Frases por faixa de mortes, sempre as mesmas para o mesmo char.

function hash(s: string): number {
  let h = 11;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TIERS: { min: number; badge: string; lines: ((n: string) => string)[] }[] = [
  {
    min: 7,
    badge: "👑 Sócio-benemérito",
    lines: [
      (n) => `${n} é patrocinador oficial da Inquisição. Com as bless dele eu comprei um barco.`,
      (n) => `Vou mandar fazer uma estátua de ${n} na porta do templo de Thais.`,
      (n) => `${n} tem mais bless comprada do que eu tenho de estoque. Tive que pedir reposição.`,
      (n) => `${n} já não compra bless, assina. Plano anual com desconto.`,
      (n) => `A Inquisição abriu um processo: ninguém morre tanto assim sem pacto com Zathroth. ${n} jura que é só ruim mesmo.`,
    ],
  },
  {
    min: 5,
    badge: "🥇 Cliente VIP",
    lines: [
      (n) => `${n} já tem crachá de funcionário do templo.`,
      (n) => `Mandei cartão de Natal pro ${n}. É o mínimo, pelo que ele gasta aqui.`,
      (n) => `O nome de ${n} já está gravado no banco do templo. Ele senta sempre no mesmo lugar.`,
      (n) => `${n} entra e eu já vou pegando "o de sempre": as cinco bless e um lenço.`,
      (n) => `${n} já é membro da Inquisição de tanto que desce aqui. Não tem mais volta.`,
    ],
  },
  {
    min: 4,
    badge: "🥈 Sócio-torcedor",
    lines: [
      (n) => `${n} virou sócio-torcedor do templo. Tem até carteirinha.`,
      (n) => `${n} pediu pra parcelar a bless em 10x sem juros. Aceitei, é cliente da casa.`,
      (n) => `Quando ${n} aparece, eu nem pergunto: já vou embrulhando as cinco.`,
      (n) => `${n} já conhece todos os guardas da cadeia de Thais pelo nome.`,
      (n) => `Às vezes é preciso cortar uma parte saudável pra salvar o todo. ${n} cortou o level, só.`,
    ],
  },
  {
    min: 3,
    badge: "🥉 Cartão fidelidade",
    lines: [
      (n) => `${n} já morreu tanto que pediu música no Fantástico.`,
      (n) => `${n} completou o cartão fidelidade: na próxima bless, o sino é por conta da casa.`,
      (n) => `${n} já tem cadeira cativa no templo.`,
      (n) => `${n} já sabe descer a escada da cadeia de Thais de olhos fechados.`,
      (n) => `Três vezes no mês? ${n} só vem aqui mais do que a minha sogra.`,
      (n) => `${n} desceu a escada da cadeia pela terceira vez. Os presos já acenam.`,
    ],
  },
  {
    min: 2,
    badge: "🪙 Freguês",
    lines: [
      (n) => `${n} ganhou o primeiro carimbo no cartão fidelidade.`,
      (n) => `${n} voltou. Eles sempre voltam.`,
      (n) => `${n} disse que foi a última vez. Anotei no caderninho, do lado das outras "últimas vezes".`,
      (n) => `Duas vezes no mês. ${n} está pegando o gosto pela coisa.`,
      (n) => `As trevas tentam quem mostra a menor fraqueza. ${n} mostrou a barra de vida inteira.`,
    ],
  },
];

export function henricusLine(name: string, deaths: number) {
  const tier = TIERS.find((t) => deaths >= t.min) ?? TIERS[TIERS.length - 1];
  return { badge: tier.badge, text: tier.lines[hash(name) % tier.lines.length](name) };
}

export const HENRICUS_SAYS = [
  "Bem-vindo, freguês! Bless de todas? Faço preço pra guilda.",
  "Blessing of the Inquisition: as cinco de uma vez. Pra quem morre muito, compensa. E aqui tem gente que morre muito.",
  "Meu negócio vai bem, obrigado. Graças a vocês.",
  "Não precisa ter vergonha. Metade da guilda já passou por aqui este mês.",
  "Aceito pagamento em gold, em platinum e em lágrimas.",
  "Saudações, fiel. Veio pela fé ou pela bless? Todo mundo diz fé.",
  "A Inquisição é a espada contra as trevas. A bless é o escudo contra a sua hunt.",
];
