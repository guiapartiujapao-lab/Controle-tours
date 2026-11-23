import { WHATSAPP_LINKS, comMensagem } from "@/lib/whatsapp";

type Props = {
  variant?: "home" | "evento";
  contextoEvento?: string;
};

export default function CtasPrincipais({ variant = "home", contextoEvento }: Props) {
  const msgRoteiro = contextoEvento
    ? `Oi! Vi o evento "${contextoEvento}" no site da Partiu Japão e queria montar um ROTEIRO PERSONALIZADO com esse evento incluso. Pode me ajudar?`
    : "Oi! Vim pelo site da Partiu Japão e quero montar um ROTEIRO PERSONALIZADO pra minha viagem ao Japão.";

  const msgPrivativo = contextoEvento
    ? `Oi! Vi o evento "${contextoEvento}" no site da Partiu Japão e queria um TOUR PRIVATIVO pra esse dia. Pode me ajudar?`
    : "Oi! Vim pelo site da Partiu Japão e tenho interesse em um TOUR PRIVATIVO com guia brasileiro.";

  return (
    <section
      className={
        variant === "home"
          ? "grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto"
          : "grid sm:grid-cols-2 gap-3 mt-4"
      }
    >
      <a
        href={comMensagem(WHATSAPP_LINKS.roteiroPersonalizado, msgRoteiro)}
        target="_blank"
        rel="noopener noreferrer"
        className="card-3d p-5 text-left flex items-start gap-4 group"
      >
        <span
          className="text-3xl shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: "#ec489915",
            border: "1px solid #ec489940",
          }}
        >
          🗺️
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900 mb-1">
            Roteiro Personalizado
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            A gente monta o roteiro ideal da sua viagem com os eventos que você quer.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-pink-600 group-hover:gap-2 transition-all">
            Falar no WhatsApp →
          </span>
        </div>
      </a>

      <a
        href={comMensagem(WHATSAPP_LINKS.tourPrivativo, msgPrivativo)}
        target="_blank"
        rel="noopener noreferrer"
        className="card-3d p-5 text-left flex items-start gap-4 group"
      >
        <span
          className="text-3xl shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: "#06b6d415",
            border: "1px solid #06b6d440",
          }}
        >
          🚗
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900 mb-1">Tour Privativo</h3>
          <p className="text-sm text-slate-600 mb-3">
            Carro + guia brasileiro só pra você e seu grupo, no dia e trajeto que quiser.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-cyan-600 group-hover:gap-2 transition-all">
            Falar no WhatsApp →
          </span>
        </div>
      </a>
    </section>
  );
}
