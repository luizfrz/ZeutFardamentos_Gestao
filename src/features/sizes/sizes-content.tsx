import { redirect } from "next/navigation";
import { api } from "@/lib/api-server";
import { getSessionUser } from "@/lib/session";
import { GridEditor } from "./grid-editor";

export async function SizesContent() {
  const me = await getSessionUser();
  if (me?.role !== "ADMIN") redirect("/"); // a API também recusa
  const grids = await api.sizeGrids();
  return (
    <div className="space-y-6">
      {grids.map((g) => <GridEditor key={`${g.id}:${g.sizes.join()}`} grid={g} />)}
      <GridEditor />
    </div>
  );
}
