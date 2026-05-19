import type { Step, Styles } from "react-joyride";

export const ALL_STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Bem-vindo ao SB Pocket",
    content:
      "Aqui você acompanha as atualizações diárias do IAF de forma simples, rápida e direto pelo celular.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="home-ranking"]',
    title: "Atualização diária",
    content:
      "Aqui ficam a pontuação do CP, o percentual geral, a classificação atual e a variação em relação à atualização anterior.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="home-pillars"]',
    title: "Resumo por pilar",
    content:
      "Os cards mostram atingimento, falta para meta, média geral dos indicadores e comparação com o relatório anterior.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="bottom-nav-dados"]',
    title: "Relatório diário",
    content:
      "Na tela de Dados você consulta todos os indicadores detalhados de cada pilar acompanhado.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="bottom-nav-config"]',
    title: "Configurações",
    content: "Na aba de Configurações você escolhe quais pilares deseja acompanhar no app.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="config-pillars"]',
    title: "Pilares acompanhados",
    content:
      "Marque os pilares que fazem sentido para sua rotina. Eles serão usados para filtrar os dados exibidos no app.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="config-save"]',
    title: "Salvar preferências",
    content:
      "Depois de ajustar os pilares, toque em salvar para manter suas preferências vinculadas ao seu usuário.",
    disableBeacon: true,
  },
  {
    target: "body",
    placement: "center",
    title: "Adicionar à tela inicial",
    content:
      "No iPhone, abra pelo Safari, toque em Compartilhar e escolha 'Adicionar à Tela de Início'. No Android, abra pelo Chrome, toque nos três pontinhos e escolha 'Instalar app' ou 'Adicionar à tela inicial'.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="config-help"]',
    title: "Abrir tutorial novamente",
    content: "Quando quiser rever este guia, toque no botão de ajuda nesta tela.",
    disableBeacon: true,
  },
];

export const JOYRIDE_STYLES: Partial<Styles> = {
  options: {
    zIndex: 9999,
    primaryColor: "#004aad",
    textColor: "#383838",
    backgroundColor: "rgba(255,255,255,0.82)",
    overlayColor: "rgba(0, 74, 173, 0.22)",
    arrowColor: "rgba(255,255,255,0.82)",
  },
  tooltip: {
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1.5px dashed rgba(26, 226, 188, 0.85)",
    borderRadius: "20px",
    boxShadow: "0 20px 55px rgba(0, 74, 173, 0.22)",
    padding: "18px",
  } as React.CSSProperties,
  tooltipTitle: {
    color: "#004aad",
    fontWeight: 700,
    fontSize: "16px",
  },
  tooltipContent: {
    color: "#383838",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  buttonNext: {
    backgroundColor: "#004aad",
    color: "#ffffff",
    borderRadius: "999px",
    padding: "8px 14px",
    fontWeight: 600,
  },
  buttonBack: {
    color: "#004aad",
    fontWeight: 600,
  },
  buttonSkip: {
    color: "#383838",
    opacity: 0.75,
  },
  buttonClose: {
    color: "#004aad",
  },
};
