import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Pet = { id: string; name: string; photo_url: string | null; status: string; region: string; age_label: string };

export function PetList({ pets, onChange }: { pets: Pet[]; onChange: () => void }) {
  const setStatus = async (id: string, status: string) => {
    await supabase.from("pets").update({ status }).eq("id", id);
    onChange();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir este pet?")) return;
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) toast.error("Não foi possível excluir.");
    onChange();
  };
  return (
    <ul className="vintage-card divide-y">
      {pets.length === 0 && <li className="p-4 italic">Nenhum pet ainda.</li>}
      {pets.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center gap-3 p-3">
          {p.photo_url && <img src={p.photo_url} alt="" className="h-12 w-12 rounded object-cover" />}
          <div className="flex-1">
            <p className="font-bold">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.age_label} · {p.region}</p>
          </div>
          <select value={p.status} onChange={(e) => setStatus(p.id, e.target.value)} className="rounded border bg-card px-2 py-1 text-sm">
            <option value="disponivel">Disponível</option>
            <option value="adotado">Adotado</option>
          </select>
          <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>Excluir</Button>
        </li>
      ))}
    </ul>
  );
}
