import { pieceIcon, PIECE_LABEL } from "@/features/molds/category";
import type { Mold, Order, PieceType, SizeGrid } from "@/lib/types";

const th = "px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-muted";
const td = "px-4 py-3 text-sm";

/** "10 anos" para grade infantil; nas demais, "M · Baby Look". */
const sizeLabel = (size: string, grid?: SizeGrid) =>
  !grid ? size : /infantil/i.test(grid.name) ? `${size} anos` : `${size} · ${grid.name}`;

interface Row { item: string; sleeve?: string; size: string; color: string; qty: number }
type Group = { key: PieceType | "OUTRO"; rows: Row[] };

/** Uma tabela por categoria (peça de cima, de baixo, corpo inteiro, outros); a coluna Manga só existe em "Peça de cima". */
export function QuantityTable({ order, molds, grids }: { order: Order; molds: Mold[]; grids: SizeGrid[] }) {
  const groups: Group[] = (["CIMA", "BAIXO", "INTEIRO", "OUTRO"] as const).map((key) => ({ key, rows: [] }));
  for (const it of order.items) {
    const mold = molds.find((m) => m.id === it.moldId);
    const group = groups.find((g) => g.key === (mold?.pieceType ?? "OUTRO"))!;
    const base = { item: mold?.name ?? "Produto", sleeve: it.model, color: it.color };
    if (!it.grids) { group.rows.push({ ...base, size: "—", qty: it.quantity ?? 0 }); continue; }
    for (const g of it.grids) {
      const grid = grids.find((x) => x.id === g.gridId);
      for (const size of grid?.sizes ?? Object.keys(g.quantities)) {
        if (g.quantities[size] > 0) group.rows.push({ ...base, size: sizeLabel(size, grid), qty: g.quantities[size] });
      }
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {groups.filter((g) => g.rows.length).map((g) => {
        const sleeve = g.key === "CIMA";
        const pieces = g.rows.reduce((s, r) => s + r.qty, 0);
        return (
          <section key={g.key} className="space-y-2">
            <h3 className="flex items-center gap-2 font-bold">
              {g.key !== "OUTRO" && pieceIcon(g.key, 18)}{g.key === "OUTRO" ? "Outros produtos" : PIECE_LABEL[g.key]}
              <span className="text-sm font-normal text-muted">· {pieces} {pieces === 1 ? "peça" : "peças"}</span>
            </h3>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[460px] text-left">
                <thead className="bg-cream-2">
                  <tr><th className={th}>Item</th>{sleeve && <th className={th}>Manga</th>}<th className={th}>Tamanho</th><th className={th}>Cor</th><th className={`${th} text-right`}>Qtd.</th></tr>
                </thead>
                <tbody>
                  {g.rows.map((r, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className={`${td} font-bold`}>{r.item}</td>{sleeve && <td className={td}>{r.sleeve ?? "—"}</td>}
                      <td className={td}>{r.size}</td><td className={td}>{r.color || "—"}</td><td className={`${td} text-right`}>{r.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
      <div className="flex justify-between rounded-lg bg-navy-soft px-4 py-3 font-bold"><span>Total do pedido</span><span className="font-extrabold">{order.totalPieces} peças</span></div>
    </div>
  );
}
