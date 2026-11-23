// =====================================================
// Links de WhatsApp — centralize aqui pra trocar depois
// =====================================================
// Os links abaixo passam por redirecionadores (go.partiujapao.com.br)
// e já levam direto pro WhatsApp do atendimento.
// Trocar aqui atualiza todos os botões do site de uma vez só.

export const WHATSAPP_LINKS = {
  // Botão verde "Falar no WhatsApp" (detalhe do evento + footer)
  atendimentoGeral: "https://go.partiujapao.com.br/r/tours-site-eventos",

  // CTA "Roteiro Personalizado" (home + detalhe do evento)
  roteiroPersonalizado: "https://go.partiujapao.com.br/r/roteiros-site-eventos",

  // CTA "Tour Privativo" (home + detalhe do evento)
  tourPrivativo: "https://go.partiujapao.com.br/r/tours-site-eventos",
} as const;

/**
 * Como os links acima são redirecionadores (o destino final é o
 * WhatsApp, não vem da nossa URL), eles não aceitam texto pré-preenchido
 * pelo query string. Essa função devolve o link como está — mantida
 * caso futuramente você troque pro `https://wa.me/...` direto.
 */
export function comMensagem(baseUrl: string, _texto: string): string {
  return baseUrl;
}
