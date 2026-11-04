import { useSyncExternalStore } from "react";

/** Relógio compartilhado: atualiza a cada `ms` e devolve o instante (ms) arredondado, ou null no servidor. */
function makeClock(ms: number) {
  return {
    subscribe(onChange: () => void) {
      const id = setInterval(onChange, ms);
      return () => clearInterval(id);
    },
    getSnapshot: () => Math.floor(Date.now() / ms) * ms,
  };
}

const second = makeClock(1000);
const minute = makeClock(60_000);

/** Hora atual do aparelho, atualizada a cada segundo. `null` até hidratar (evita divergência servidor/cliente). */
export const useNowSeconds = () => useSyncExternalStore(second.subscribe, second.getSnapshot, () => null);
/** Hora atual do aparelho, atualizada a cada minuto. */
export const useNowMinutes = () => useSyncExternalStore(minute.subscribe, minute.getSnapshot, () => null);
