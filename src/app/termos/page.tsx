import Link from "next/link";
import Box from "@/components/Box";

export const metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <div className="max-w-3xl">
      <h1>Termos de uso e privacidade</h1>
      <Box title="Versão de 26/09/2026">
        <div className="space-y-3 text-[13px]">
          <p>
            Ao criar uma conta ou usar o TibiaConsult, você declara que leu e concorda com estes termos. Se não concordar, não crie conta: as
            páginas de consulta continuam abertas sem cadastro.
          </p>

          <h2>1. Plataforma beta</h2>
          <p>
            O TibiaConsult é um projeto pessoal, gratuito, feito por jogadores para jogadores, em fase beta e em desenvolvimento. Funções podem
            mudar, sair do ar, apresentar erro ou perder dados a qualquer momento, sem aviso prévio.
          </p>

          <h2>2. Sem garantia</h2>
          <p>
            Todo o conteúdo é oferecido como está. Simuladores, rotações, recomendações de hunt, valores de dano, custos e demais números são
            estimativas feitas a partir de fontes públicas de fãs (TibiaWiki, TibiaPal e outras citadas em cada página) e de fórmulas da comunidade
            que a CipSoft não publica. Eles podem estar desatualizados ou errados. Confira no jogo antes de gastar itens, gold, Tibia Coins ou
            tempo.
          </p>

          <h2>3. Isenção de responsabilidade</h2>
          <p>
            Na máxima extensão permitida pela lei, os responsáveis pelo TibiaConsult não respondem por perdas de qualquer natureza ligadas ao uso
            do site, incluindo, sem limitação: morte ou perda de level do personagem, perda de itens, gold ou Tibia Coins, decisões de compra,
            venda, forja ou gasto tomadas com base nos cálculos, indisponibilidade do serviço, perda de dados salvos e falhas de terceiros
            (hospedagem, banco de dados e provedores de e-mail).
          </p>

          <h2>4. Sua conta e sua senha</h2>
          <p>
            <b>Não use o e-mail nem a senha da sua conta do Tibia.</b> Crie uma senha exclusiva para este site. O TibiaConsult nunca pede login,
            senha, token ou autenticador do Tibia. Você é responsável por guardar a sua senha e por tudo que for feito com a sua conta.
          </p>

          <h2>5. Dados que guardamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>E-mail de acesso e a data em que você aceitou estes termos.</li>
            <li>O que você cadastrar: chars, set, Wheel, gemas, anotações e progresso do bestiário.</li>
            <li>Sugestões e relatos de erro enviados pela caixa de feedback.</li>
            <li>Level, experiência e mortes dos chars cadastrados, lidos do tibia.com pela API pública do TibiaData.</li>
          </ul>
          <p>
            Cada conta só vê os próprios dados. Nenhuma outra conta tem acesso ao que você cadastra. A exceção é opcional: se você ligar
            &quot;Mostrar no mural e no ranking&quot; num char, o nome, mundo, vocação, level, XP ganha e mortes desse char ficam visíveis
            para todos no mural Caixão e Vela Preta e no ranking de XP. Desligar a opção tira o char das duas páginas. O administrador do site pode ver os dados para manutenção e suporte. Não vendemos nem repassamos
            dados a ninguém.
          </p>
          <p>
            Os dados ficam no Supabase (banco de dados) e o site é hospedado na Vercel. Para pedir a exclusão da sua conta e de tudo que ela guarda,
            use a <Link href="/feedback">caixa de sugestões</Link> com o assunto &quot;excluir conta&quot;.
          </p>

          <h2>6. Tibia e CipSoft</h2>
          <p>
            Tibia e todo o seu conteúdo são de propriedade da CipSoft GmbH. O TibiaConsult é uma ferramenta de fãs, sem vínculo, patrocínio ou
            aprovação da CipSoft. Imagens de itens, criaturas e feitiços são carregadas do tibia.com e da TibiaWiki.
          </p>

          <h2>7. Uso adequado</h2>
          <p>
            Não tente acessar dados de outras contas, sobrecarregar o site ou usá-lo para algo ilegal. Contas com uso abusivo podem ser removidas.
          </p>

          <h2>8. Mudanças</h2>
          <p>Estes termos podem mudar. A versão e a data ficam no topo desta página. Continuar usando a conta depois de uma mudança significa aceitar a nova versão.</p>
        </div>
      </Box>
    </div>
  );
}
