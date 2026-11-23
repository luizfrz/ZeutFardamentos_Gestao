import type { Mold, Order, OrderItem, SizeGrid } from "@/lib/types";

const th = "px-4 py-3";
const td = "px-4 py-3 font-semibold";

/** "10 anos" para grade infantil; nas demais, "M · Baby Look". */
const sizeLabel = (size: string, grid?: SizeGrid) =>
  !grid ? size : /infantil/i.test(grid.name) ? `${size} anos` : `${size} · ${grid.name}`;

const itemPieces = (it: OrderItem) =>
  it.grids ? it.grids.reduce((s, g) => s + Object.values(g.quantities).reduce((a, b) => a + b, 0), 0) : it.quantity ?? 0;

/** Uma tabela por item do pedido, para as colunas não se misturarem entre produtos diferentes. */
export function QuantityTable({ order, molds, grids }: { order: Order; molds: Mold[]; grids: SizeGrid[] }) {
  return (
    <div className="mt-5 space-y-4">
      {order.items.map((it, i) => {
        const mold = molds.find((m) => m.id === it.moldId);
        const hasSleeve = mold?.pieceType === "CIMA";
        const rows: { size: string; qty: number }[] = [];
        for (const g of it.grids ?? []) {
          const grid = grids.find((x) => x.id === g.gridId);
          for (const size of grid?.sizes ?? Object.keys(g.quantities)) {
            if (g.quantities[size] > 0) rows.push({ size: sizeLabel(size, grid), qty: g.quantities[size] });
          }
        }
        if (!it.grids) rows.push({ size: "—", qty: it.quantity ?? 0 });
        return (
          <div key={it.id ?? i} className="overflow-x-auto rounded-xl border border-line">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-cream-2 px-4 py-3">
              <span className="font-extrabold">{mold?.name ?? "Produto"}</span>
              <span className="text-sm font-semibold text-muted">{it.color}</span>
            </div>
            <table className="w-full min-w-[360px] text-left text-[15px]">
              <thead>
                <tr className="text-xs font-extrabold uppercase tracking-wider text-muted">
                  <th className={th}>Tamanho</th>{hasSleeve && <th className={th}>Manga</th>}<th className={`${th} text-right`}>Qtd.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.size} className="border-t border-line">
                    <td className={td}>{r.size}</td>{hasSleeve && <td className={td}>{it.model ?? "—"}</td>}<td className={`${td} text-right`}>{r.qty}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line bg-navy-soft font-extrabold"><td className="px-4 py-3" colSpan={hasSleeve ? 2 : 1}>Subtotal</td><td className="px-4 py-3 text-right">{itemPieces(it)}</td></tr>
              </tfoot>
            </table>
          </div>
        );
      })}
      <div className="flex justify-between rounded-xl bg-navy px-4 py-3.5 font-extrabold text-white"><span>Total do pedido</span><span>{order.totalPieces} peças</span></div>
    </div>
  );
}
