import Link from "next/link";
import Box from "@/components/Box";

export const metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <div className="max-w-3xl">
      <h1>Termos de uso e privacidade</h1>
      <Box title="Versão de 27/09/2026 (3)">
        <div className="space-y-3 text-[13px]">
          <p>
            Ao criar uma conta ou usar o TibiaConsult, você declara que leu e concorda com estes termos. Se não concordar, não crie conta: as páginas de
            consulta continuam abertas sem cadastro.
          </p>

          <h2>1. Plataforma beta</h2>
          <p>
            O TibiaConsult é um projeto pessoal, gratuito, feito por jogadores para jogadores, em fase beta e em desenvolvimento. Funções podem mudar, sair do
            ar, apresentar erro ou perder dados a qualquer momento, sem aviso prévio.
          </p>

          <h2>2. Sem garantia</h2>
          <p>
            Todo o conteúdo é oferecido como está. Simuladores, rotações, recomendações de hunt, valores de dano, custos e demais números são estimativas feitas
            a partir de fontes públicas de fãs (TibiaWiki, TibiaPal e outras citadas em cada página) e de fórmulas da comunidade que a CipSoft não publica. Eles
            podem estar desatualizados ou errados. Confira no jogo antes de gastar itens, gold, Tibia Coins ou tempo.
          </p>

          <h2>3. Isenção de responsabilidade</h2>
          <p>
            Na máxima extensão permitida pela lei, os responsáveis pelo TibiaConsult não respondem por perdas de qualquer natureza ligadas ao uso do site,
            incluindo, sem limitação: morte ou perda de level do personagem, perda de itens, gold ou Tibia Coins, decisões de compra, venda, forja ou gasto
            tomadas com base nos cálculos, indisponibilidade do serviço, perda de dados salvos e falhas de terceiros (hospedagem, banco de dados e provedores de
            e-mail).
          </p>

          <h2>4. Sua conta e sua senha</h2>
          <p>
            <b>Não use o e-mail nem a senha da sua conta do Tibia.</b> Crie uma senha exclusiva para este site. O TibiaConsult nunca pede login, senha, token ou
            autenticador do Tibia. Você é responsável por guardar a sua senha e por tudo que for feito com a sua conta.
          </p>

          <h2>5. Dados que guardamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>E-mail de acesso e a data em que você aceitou estes termos.</li>
            <li>O que você cadastrar: chars, set, Wheel, gemas, anotações e progresso do bestiário.</li>
            <li>Sugestões e relatos de erro enviados pela caixa de feedback.</li>
            <li>Level, experiência e mortes dos chars cadastrados, lidos do tibia.com pela API pública do TibiaData.</li>
            <li>Tempo online dos chars cadastrados, contado a cada 5 minutos pela lista pública de quem está online no mundo.</li>
            <li>
              Membros das guildas acompanhadas (Rangers e Rangers Academy, em Belobra): nome, level, vocação, cargo, mortes e tempo online, tirados das páginas
              públicas do tibia.com, como fazem os sites de estatísticas de guilda. Eles aparecem na Taverna, no ranking, no Funcionário do Mês e no perfil
              público mesmo sem conta. Quem não quiser aparecer pede pelo <Link href="/feedback">Reportar ou sugerir</Link> e o char sai de todas as páginas.
            </li>
            <li>Comentários, fofocas, reações e denúncias que você fizer na comunidade.</li>
            <li>
              Lembretes que você marcar (boss, stamina) e as creatures que você acompanha no Bestiary Tracker.
            </li>
            <li>
              Avisos da sua conta (comentários, fofocas, mortes e level ups dos seus chars, lembretes e boosted do dia), apagados depois de 60 dias. Se você ligar as notificações, o
              endereço de entrega que o navegador cria para este aparelho; desligar apaga o endereço.
            </li>
            <li>
              Contagem de visitas: a página vista, o dia e um código aleatório criado no seu navegador, sem IP e sem cookie de terceiros. Serve só para saber
              quantas pessoas usam o site. Apagado depois de 180 dias.
            </li>
          </ul>
          <p>
            Cada conta só vê os próprios dados. Nenhuma outra conta tem acesso ao que você cadastra. A exceção é opcional: se você liberar um char na
            comunidade, o nome, mundo, vocação, level, XP ganha, tempo online e mortes desse char ficam visíveis para todos na Taverna (e no Caixão e Vela Preta), no
            ranking de XP, no Funcionário do Mês e no perfil público. Tirar da comunidade tira o char dessas páginas. O administrador do site pode ver os dados
            para manutenção e suporte. Não vendemos nem repassamos dados a ninguém.
          </p>
          <p>
            Os dados ficam no Supabase (banco de dados) e o site é hospedado na Vercel. Para pedir a exclusão da sua conta e de tudo que ela guarda, use a{" "}
            <Link href="/feedback">caixa de sugestões</Link> com o assunto &quot;excluir conta&quot;.
          </p>

          <h2>6. Tibia e CipSoft</h2>
          <p>
            Tibia e todo o seu conteúdo são de propriedade da CipSoft GmbH. O TibiaConsult é uma ferramenta de fãs, sem vínculo, patrocínio ou aprovação da
            CipSoft. Imagens de itens, creatures e feitiços são carregadas do tibia.com e da TibiaWiki.
          </p>

          <h2>7. Uso adequado</h2>
          <p>Não tente acessar dados de outras contas, sobrecarregar o site ou usá-lo para algo ilegal. Contas com uso abusivo podem ser removidas.</p>

          <h2 id="comunidade" className="scroll-mt-24">
            8. Comunidade: Taverna e perfis
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Para comentar, libere o char na comunidade (um clique). Comentários e o nome do char que os escreveu são públicos. Reações também. Cada char só
              pode estar liberado em uma conta; se alguém liberou o seu, avise pelo Reportar ou sugerir.
            </li>
            <li>O perfil público (/char/nome) só existe para chars liberados na comunidade, e mostra level, mortes, tempo online e conquistas.</li>
            <li>
              Zoeira é bem-vinda; ofensa não. Proibido: preconceito, ataques pessoais, ameaças, dados pessoais de terceiros, golpes, venda de itens ou contas e
              divulgação de bot/cheat. Palavrão é liberado; termos preconceituosos são bloqueados automaticamente.
            </li>
            <li>
              Qualquer conta pode denunciar. Com 3 denúncias o conteúdo fica oculto até a moderação analisar. A moderação pode apagar conteúdo e remover contas
              que descumprirem estas regras. Você pode apagar os seus comentários quando quiser.
            </li>
            <li>
              Fofoca pro Rashid: só sobre mortes que estão na Taverna. O Rashid publica sem dizer quem contou, mas a moderação sabe o autor e responde por abuso.
              Vale zoeira sobre a morte; não vale inventar, expor vida pessoal ou atacar alguém. Limite de 3 fofocas por hora e uma por morte.
            </li>
            <li>Há limite de 30 comentários por hora por conta, contra spam.</li>
          </ul>

          <h2>9. Mudanças</h2>
          <p>
            Estes termos podem mudar. A versão e a data ficam no topo desta página. Continuar usando a conta depois de uma mudança significa aceitar a nova
            versão.
          </p>
        </div>
      </Box>
    </div>
  );
}
