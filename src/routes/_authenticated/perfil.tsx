import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDraft } from "@/lib/drafts";
import { signedUrl, uploadMedia } from "@/lib/storage";
import { isValidCPF, isValidCNPJ, lookupCep, maskCEP, maskCPF, maskPhone } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/AuthForms";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Meu Perfil — Carita's Pets" }, { name: "description", content: "Seus dados, censo de adoção e comprovante." }] }),
  component: PerfilPage,
});

const EMPTY = {
  name: "", phone: "", cep: "", address: "", cpf: "", cnpj: "", social_link: "",
  moradia: "", telas: "", outros_animais: "", pessoas: "", concordam: "", tempo_sozinho: "", motivo: "",
};

const TYPE_LABEL = { adotante: "Adotante", ong: "ONG", protetor: "Protetor Independente" } as const;

function PerfilPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).single()).data,
  });
  const d = useDraft("draft:census", EMPTY);
  const v = d.value;
  const [file, setFile] = useState<File | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [cepMsg, setCepMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || localStorage.getItem("draft:census")) return;
    const c = (profile.census ?? {}) as Record<string, string>;
    d.setValue({
      ...EMPTY, ...c,
      name: profile.name ?? "", phone: profile.phone ?? "", cep: profile.cep ?? "", address: profile.address ?? "",
      cpf: profile.cpf ?? "", cnpj: profile.cnpj ?? "", social_link: profile.social_link ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const { data: proofUrl } = useQuery({
    queryKey: ["proof", profile?.proof_path],
    enabled: !!profile?.proof_path,
    queryFn: () => signedUrl("proofs", profile!.proof_path!),
  });

  const checkCep = async () => {
    const r = await lookupCep(v.cep);
    if (r.ok) { setCepMsg(null); d.update({ address: r.address }); } else setCepMsg(r.error);
    return r.ok;
  };

  const save = async () => {
    if (!user || !profile) return;
    const type = profile.profile_type;
    if ((type !== "ong") && v.cpf && !isValidCPF(v.cpf)) return toast.error("CPF inválido.");
    if (type === "adotante" && !isValidCPF(v.cpf)) return toast.error("Informe um CPF válido.");
    if (type === "ong" && v.cnpj && !isValidCNPJ(v.cnpj)) return toast.error("CNPJ inválido.");
    if (type === "adotante" && !(await checkCep())) return toast.error("Verifique o CEP.");
    setBusy(true);
    let avatar_url = profile.avatar_url;
    if (avatar) {
      try { avatar_url = await uploadMedia(user.id, avatar); }
      catch { setBusy(false); return toast.error("Falha ao enviar a foto."); }
    }
    let proof_path = profile.proof_path;
    if (file) {
      const path = `${user.id}/comprovante-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("proofs").upload(path, file);
      if (error) { setBusy(false); return toast.error("Falha ao enviar comprovante."); }
      proof_path = path;
    }
    const { name, phone, cep, address, cpf, cnpj, social_link, ...census } = v;
    const { error } = await supabase.from("profiles").update({
      name, phone, cep, address, cpf: cpf || null, cnpj: cnpj || null, social_link: social_link || null, census, proof_path, avatar_url, updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error("Não foi possível salvar.");
    d.reset(v);
    setFile(null);
    setAvatar(null);
    toast.success("Perfil salvo!");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  if (!profile) return <p className="italic">Carregando…</p>;
  const isAdopter = profile.profile_type === "adotante";

  const choice = (k: keyof typeof EMPTY, label: string, opts: string[]) => (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button type="button" key={o} onClick={() => d.update({ [k]: o } as Partial<typeof EMPTY>)}
            className={`rounded-full border px-4 py-1.5 ${v[k] === o ? "border-primary bg-secondary" : "bg-card"}`}>{o}</button>
        ))}
      </div>
    </Field>
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
      <form className="vintage-card space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <h1 className="mt-6 rounded-lg bg-blush px-4 py-2 font-bold text-3xl text-primary">Editar Meu Perfil</h1>
        <div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-secondary bg-card p-3">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Sua foto" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xs">Sem foto</div>
          )}
          <Field label="Foto de perfil" hint="Obrigatória para conversar com ONGs e protetores">
            <Input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />
          </Field>
        </div>
        <Field label="Nome"><Input value={v.name} onChange={(e) => d.update({ name: e.target.value })} /></Field>
        <Field label="WhatsApp"><Input value={v.phone} onChange={(e) => d.update({ phone: maskPhone(e.target.value) })} /></Field>
        {profile.profile_type === "ong" ? (
          <Field label="CNPJ"><Input value={v.cnpj} disabled /></Field>
        ) : (
          <Field label="CPF"><Input value={v.cpf} onChange={(e) => d.update({ cpf: maskCPF(e.target.value) })} /></Field>
        )}
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <Field label="CEP" hint={cepMsg ?? "Apenas DF e entorno"}>
            <Input value={v.cep} onChange={(e) => d.update({ cep: maskCEP(e.target.value) })} onBlur={checkCep} />
          </Field>
          <Field label="Endereço"><Input value={v.address} onChange={(e) => d.update({ address: e.target.value })} /></Field>
        </div>
        {!isAdopter && <Field label="Instagram / Site / Rede social"><Input value={v.social_link} onChange={(e) => d.update({ social_link: e.target.value })} /></Field>}

        {isAdopter && (
          <div className="space-y-4 rounded-lg border border-primary/30 bg-accent/60 p-4">
            <h2 className="text-xl font-bold">Censo de adoção</h2>
            {choice("moradia", "Você mora em casa ou apartamento?", ["Casa", "Apartamento", "Chácara"])}
            {choice("telas", "Possui telas de proteção?", ["Sim", "Não", "Vou instalar"])}
            {choice("outros_animais", "Já tem outros animais?", ["Não", "Cães", "Gatos", "Cães e gatos"])}
            {choice("concordam", "Todos na casa concordam com a adoção?", ["Sim", "Não"])}
            <Field label="Quantas pessoas moram com você?"><Input value={v.pessoas} onChange={(e) => d.update({ pessoas: e.target.value })} /></Field>
            <Field label="Quantas horas o pet ficaria sozinho por dia?"><Input value={v.tempo_sozinho} onChange={(e) => d.update({ tempo_sozinho: e.target.value })} /></Field>
            <Field label="Por que deseja adotar?"><Input value={v.motivo} onChange={(e) => d.update({ motivo: e.target.value })} /></Field>
            <div className="rounded-lg border-2 border-dashed border-secondary bg-card p-3">
              <Field label="Upload de Comprovante de Residência" hint="Imagem ou PDF">
                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </Field>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={busy}>Enviar</Button>
          <Button type="button" variant="secondary" onClick={() => toast.success("Rascunho guardado neste aparelho.")}>Salvar para continuar depois</Button>
        </div>
        {d.savedLabel && <p className="text-sm italic text-primary">{d.savedLabel}</p>}
      </form>

      <aside className="vintage-card h-fit space-y-2 p-6">
        <h2 className="text-xl font-bold italic text-primary">Perfil completo</h2>
        <p className="inline-block rounded-full bg-secondary px-3 py-0.5 text-sm">{TYPE_LABEL[profile.profile_type]}</p>
        <Row k="Nome" v={profile.name} /><Row k="E-mail" v={profile.email} /><Row k="WhatsApp" v={profile.phone} />
        <Row k={profile.profile_type === "ong" ? "CNPJ" : "CPF"} v={profile.profile_type === "ong" ? profile.cnpj : profile.cpf} />
        <Row k="CEP" v={profile.cep} /><Row k="Endereço" v={profile.address} />
        {profile.social_link && <Row k="Rede social" v={profile.social_link} />}
        {isAdopter && Object.entries((profile.census ?? {}) as Record<string, string>).filter(([, x]) => x).map(([k, x]) => <Row key={k} k={k.replace("_", " ")} v={x} />)}
        {isAdopter && <p className="text-sm">Comprovante: {proofUrl ? <a href={proofUrl} target="_blank" rel="noreferrer" className="underline">ver arquivo</a> : <i>não enviado</i>}</p>}
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | null | undefined }) {
  return <p className="text-sm"><span className="capitalize text-muted-foreground">{k}:</span> {v || <i>—</i>}</p>;
}
