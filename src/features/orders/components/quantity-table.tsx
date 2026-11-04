import type { Mold, Order, SizeGrid } from "@/lib/types";

export function QuantityTable({ order, molds, grids }: { order: Order; molds: Mold[]; grids: SizeGrid[] }) {
  const rows: { item: string; size: string; color: string; qty: number }[] = [];
  for (const it of order.items) {
    const mold = molds.find((m) => m.id === it.moldId);
    const label = it.model ?? mold?.name ?? "Produto";
    if (it.grids) {
      for (const g of it.grids) {
        const grid = grids.find((x) => x.id === g.gridId);
        for (const size of grid?.sizes ?? Object.keys(g.quantities)) {
          const qty = g.quantities[size];
          if (qty > 0) rows.push({ item: it.grids.length > 1 && grid ? `${label} · ${grid.name}` : label, size, color: it.color, qty });
        }
      }
    } else rows.push({ item: label, size: "—", color: it.color, qty: it.quantity ?? 0 });
  }
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[480px] text-left text-[15px]">
        <thead>
          <tr className="bg-cream-2 text-xs font-extrabold uppercase tracking-wider text-muted">
            <th className="px-4 py-3">Item</th><th className="px-4 py-3">Tamanho</th><th className="px-4 py-3">Cor</th><th className="px-4 py-3 text-right">Qtd.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              <td className="px-4 py-3.5 font-extrabold">{r.item}</td><td className="px-4 py-3.5 font-semibold">{r.size}</td>
              <td className="px-4 py-3.5 font-semibold">{r.color}</td><td className="px-4 py-3.5 text-right font-semibold">{r.qty}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-navy-soft font-extrabold"><td className="px-4 py-3.5" colSpan={3}>Total</td><td className="px-4 py-3.5 text-right">{order.totalPieces} peças</td></tr>
        </tfoot>
      </table>
    </div>
  );
}
