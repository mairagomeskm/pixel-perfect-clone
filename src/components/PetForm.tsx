import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDraft } from "@/lib/drafts";
import { uploadMedia } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/AuthForms";
import { REGIONS } from "@/routes/adocao";

const EMPTY = { name: "", species: "cao", age_label: "", is_puppy: false, region: "Plano Piloto", description: "", organization_id: "" };

export function PetForm({ onSaved, orgs }: { onSaved: () => void; orgs?: { id: string; name: string }[] }) {
  const { user } = useAuth();
  const d = useDraft("draft:pet", EMPTY);
  const v = d.value;
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!v.name || !file) return toast.error("Informe nome e foto do pet.");
    setBusy(true);
    try {
      const photo_url = await uploadMedia(user.id, file);
      const { error } = await supabase.from("pets").insert({
        ...v, organization_id: v.organization_id || null, photo_url, owner_id: user.id,
      });
      if (error) throw error;
      d.reset();
      setFile(null);
      toast.success("Pet cadastrado!");
      onSaved();
    } catch {
      toast.error("Não foi possível cadastrar.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="vintage-card space-y-3 p-5">
      <h2 className="text-xl font-bold">Cadastrar pet</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome"><Input value={v.name} onChange={(e) => d.update({ name: e.target.value })} /></Field>
        <Field label="Idade"><Input placeholder="ex: 3 meses" value={v.age_label} onChange={(e) => d.update({ age_label: e.target.value })} /></Field>
        <Field label="Espécie">
          <select className="h-9 w-full rounded-md border bg-card px-3" value={v.species} onChange={(e) => d.update({ species: e.target.value })}>
            <option value="cao">Cão</option><option value="gato">Gato</option>
          </select>
        </Field>
        <Field label="Região">
          <select className="h-9 w-full rounded-md border bg-card px-3" value={v.region} onChange={(e) => d.update({ region: e.target.value })}>
            {REGIONS.slice(1).map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        {orgs && (
          <Field label="ONG / Protetor">
            <select className="h-9 w-full rounded-md border bg-card px-3" value={v.organization_id} onChange={(e) => d.update({ organization_id: e.target.value })}>
              <option value="">—</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="Foto"><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={v.is_puppy} onChange={(e) => d.update({ is_puppy: e.target.checked })} /> É filhote</label>
      <Field label="Descrição"><Input value={v.description} onChange={(e) => d.update({ description: e.target.value })} /></Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>Enviar</Button>
        <Button type="button" variant="secondary" onClick={() => toast.success("Rascunho guardado.")}>Salvar para continuar depois</Button>
      </div>
      {d.savedLabel && <p className="text-sm italic text-primary">{d.savedLabel}</p>}
    </form>
  );
}
