import InstallGuide from "@/components/InstallGuide";

export const metadata = { title: "Instalar o app" };

export default function InstalarPage() {
  return (
    <div className="max-w-2xl">
      <h1>Instalar o app</h1>
      <p className="on-dark mb-4">
        O TibiaConsult vira um app de verdade: ícone próprio, janela própria e um clique para abrir. Não ocupa espaço nem precisa de loja, e se atualiza
        sozinho.
      </p>
      <div className="tc-themebox mb-4">
        <div className="tc-themebox-title">Passo a passo</div>
        <div className="tc-themebox-body text-[13px]">
          <InstallGuide />
        </div>
      </div>
      <div className="tc-themebox">
        <div className="tc-themebox-title">Não achou o ícone?</div>
        <div className="tc-themebox-body text-[12px] space-y-2">
          <p>
            <b>Chrome no PC:</b> menu ⋮ → Transmitir, salvar e compartilhar → Instalar página como app.
          </p>
          <p>
            <b>Edge no PC:</b> menu ··· → Aplicativos → Instalar este site como um aplicativo. O Edge também oferece &quot;Fixar na barra de tarefas&quot; logo
            depois de instalar.
          </p>
          <p>
            <b>Fixar na barra de tarefas (Windows):</b> com o app aberto, clique com o botão direito no ícone dele na barra de tarefas → Fixar na barra de
            tarefas. Para o menu Iniciar: procure &quot;TibiaConsult&quot; no Iniciar → botão direito → Fixar em Iniciar.
          </p>
          <p>
            <b>iPhone:</b> precisa ser pelo Safari. Em outros navegadores do iPhone a opção pode não aparecer.
          </p>
          <p>
            <b>Desinstalar:</b> no PC, abra o app → menu ⋮ → Desinstalar. No celular, segure o ícone e remova, como qualquer app.
          </p>
        </div>
      </div>
    </div>
  );
}
