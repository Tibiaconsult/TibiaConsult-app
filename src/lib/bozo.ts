// Bozo, o bobo da corte de Thais: faz uma piada em toda morte da Taverna. As piadas de monstro e de vocação são as dele no jogo (TibiaWiki, Bozo/Transcripts),
// adaptadas para português e para a morte; as demais seguem o mesmo estilo.

import { type RumorDeath, killersOf } from "@/lib/rashid";

function hash(s: string): number {
  let h = 17;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// piada pela creature que matou (a primeira que casar com o nome do matador)
const MONSTER: [RegExp, (n: string, k: string) => string][] = [
  [/beholder|bonebeast|eye/i, (n, k) => `Por que o ${k} é tão feio? Porque o pai e a mãe também eram. E por que ${n} morreu pra ele? Aí nem eu sei.`],
  [/cyclops/i, (n, k) => `Quantos olhos tem um ${k}? Um pra cada ponto de QI do adversário. Hoje, ${n} empatou com ele.`],
  [/demon/i, (n, k) => `Por que os heróis experientes são mais rápidos? Porque ${k} adora fast food. ${n} foi o delivery de hoje.`],
  [/dragon|wyrm|drake/i, (n, k) => `Por que o ${k} cospe fogo? Comeu sorcerer demais com molho de pimenta. Hoje o prato foi ${n}.`],
  [/minotaur/i, (n) => `O que todo minotaurinho quer ser quando crescer? Vaqueiro! E ${n}, quando crescer, quer sobreviver.`],
  [/orc/i, (n, k) => `Por que o ${k} tem a pele verde? Comeu estragado. ${n} também não caiu bem pra ele, mas caiu.`],
  [/rat/i, (n, k) => `Por que o ${k} tem perna de pau? Porque é ex-pirata. E ${n} agora é ex-level.`],
  [/skeleton|undead|lich|mummy/i, (n, k) => `Por que o ${k} foge quando apanha? Porque não tem espinha. ${n} tinha, e mesmo assim não fugiu.`],
  [/spider|tarantula|crawler/i, (n, k) => `Por que o ${k} atravessou a rua? Pra pegar ${n}. Ah, você já conhecia essa?`],
  [/troll/i, (n) => `Por que troll mora debaixo da terra? Porque em cima tem PK demais. ${n} devia ter ido morar com eles.`],
  [/wolf|werewolf|hound/i, (n, k) => `Por que o ${k} uiva? Quem fica online tanto tempo acaba assim. ${n} que o diga.`],
  [/giant|behemoth|juggernaut/i, (n, k) => `O ${k} é tão grande que ${n} achou que era parede. Parede não bate de volta.`],
  [/phantom|ghost|soul|apparition/i, (n, k) => `${n} morreu pra um ${k}. Pelo menos agora os dois têm assunto.`],
];

// piada pela vocação de quem morreu (as quatro primeiras são do Bozo no jogo)
const VOCATION: [RegExp, (n: string) => string][] = [
  [/knight/i, (n) => `Já reparou que knight velho só tem cicatriz nas costas? ${n} está a caminho de ficar velho.`],
  [/paladin/i, (n) => `Paladin é o favorito do rei porque sabe fazer reverência. ${n} caprichou na reverência pro chão.`],
  [/sorcerer/i, (n) => `O bom do sorcerer é que ele não consegue estar em dois lugares ao mesmo tempo. ${n} escolheu o templo.`],
  [/druid/i, (n) => `Em terra de druid, faça como os coelhos: corra. ${n} esqueceu dessa parte.`],
  [/monk/i, (n) => `Monk medita tanto que ${n} só percebeu que tinha morrido quando abriu os olhos no templo.`],
];

const GENERIC = [
  (n: string) => `Sou o cobrador de impostos real! ${n} já pagou o imposto do mês: em level.`,
  (n: string) => `Eu vendo a magia de "aliviar a carga" por 200 gold. ${n} ganhou de graça: aliviou a backpack inteira.`,
  (n: string) => `Quer entrar na guilda dos bobos? ${n} já é sócio, só não sabia.`,
  (n: string) => `Vendi uma "mace of the fury" pro ${n}. Era um rolo de macarrão. Pelo resultado, ele usou na hunt.`,
  (n: string) => `Eu queria ser herói também, mas era qualificado demais. ${n} não teve esse problema.`,
  (n: string) => `Sabe qual a diferença entre ${n} e um bobo da corte? O bobo cobra pra fazer o rei rir.`,
  (n: string) => `O rei riu tanto dessa morte de ${n} que me deu folga amanhã.`,
  (n: string) => `Eu faço palhaçada por profissão. ${n} faz de graça, e ainda paga bless.`,
  (n: string) => `Toc toc! Quem é? É ${n}, voltando pro templo. De novo.`,
  (n: string) => `Nem a flor de água que eu uso pra molhar o rei deixa ninguém tão ensopado de vergonha quanto ${n} hoje.`,
  (n: string) => `A guilda dos bobos tem título de "grande bobo". ${n} está a uma morte de ganhar.`,
  (n: string) => `${n} pediu uma piada pra animar. Eu disse: "abre o mural". Ele abriu e viu a própria morte.`,
];

/** Piada do Bozo para a morte: de monstro quando o matador tem piada, senão de vocação ou uma das dele. Sempre a mesma para a mesma morte. */
export function bozoJoke(d: RumorDeath & { vocation?: string | null }): string {
  const h = hash(d.name + d.died_at);
  const k = killersOf(d)[0] ?? "";
  const m = MONSTER.find(([re]) => re.test(k));
  if (m && !d.by_player) return m[1](d.name, k);
  const v = VOCATION.find(([re]) => re.test(d.vocation ?? ""));
  return v && h % 3 === 0 ? v[1](d.name) : GENERIC[(h >> 4) % GENERIC.length](d.name);
}

/** Falas soltas do Bozo para o banner da lateral. */
export const BOZO_SAYS = [
  "Sou o cobrador de impostos real! Digo, o bobo da corte.",
  "Por que o dragão cospe fogo? Comeu sorcerer com pimenta!",
  "Quer entrar na guilda dos bobos? A inscrição é morrer pra rat.",
  "Tenho uma piada pra cada morte da guilda. Estoque garantido.",
];
