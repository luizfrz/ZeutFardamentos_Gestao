/** Etapas de produção, na ordem (mesmas chaves da API). */
export const STAGES = [
  { key: "ARQUIVO", label: "Arquivo" },
  { key: "ENVIO_IMPRESSAO", label: "Envio p/ Impressão" },
  { key: "IMPRESSAO", label: "Impressão" },
  { key: "CORTE", label: "Corte" },
  { key: "COSTURA", label: "Costura" },
  { key: "EMPACOTADO", label: "Empacotado" },
  { key: "ENTREGUE", label: "Entregue" },
] as const;

/** Última etapa concluída (nome), ou undefined se nenhuma. */
export const currentStage = (done: string[] = []) => [...STAGES].reverse().find((s) => done.includes(s.key))?.label;
