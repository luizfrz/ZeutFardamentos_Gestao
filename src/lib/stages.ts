/** Etapas de produção, na ordem (mesmas chaves da API). */
export const STAGES = [
  { key: "ARQUIVO", label: "Arquivo", notice: "Arquivo criado" },
  { key: "ENVIO_IMPRESSAO", label: "Envio p/ Impressão" },
  { key: "IMPRESSAO", label: "Impressão", notice: "Impressão concluída" },
  { key: "SUBLIMADO", label: "Sublimado", notice: "Foi sublimado" },
  { key: "CORTE", label: "Cortado", notice: "Foi cortado" }, // chave CORTE mantida: já existe em pedidos salvos
  { key: "COSTURA", label: "Costura", notice: "Costura concluída" },
  { key: "EMPACOTADO", label: "Empacotado", notice: "Pedido empacotado" },
  { key: "ENTREGUE", label: "Entregue", notice: "Pedido entregue" },
] as const;

/** Última etapa concluída (nome), ou undefined se nenhuma. */
export const currentStage = (done: string[] = []) => [...STAGES].reverse().find((s) => done.includes(s.key))?.label;
