import NotificationList from "./NotificationList";

export const metadata = { title: "Avisos" };

export default function NotificacoesPage() {
  return (
    <div className="max-w-3xl">
      <h1>Avisos</h1>
      <p className="on-dark mb-4">
        Comentários nas mortes e nos level ups dos seus chars, fofocas novas pro Rashid, mortes e level ups. Ligue as notificações para receber no celular ou no
        PC, mesmo com o site fechado.
      </p>
      <NotificationList />
    </div>
  );
}
