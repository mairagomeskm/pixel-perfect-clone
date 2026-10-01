import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDraft } from "@/lib/drafts";
import { signedUrl, uploadMedia } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/AuthForms";
import { PetForm } from "@/components/PetForm";
import { PetList } from "@/components/PetList";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Administração — Carita's Pets" }, { name: "description", content: "Painel de administração." }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <p className="vintage-card p-6 italic">Esta área é exclusiva da administração.</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl italic text-primary">Administração</h1>
      <Tabs defaultValue="pets">
        <TabsList className="no-scrollbar flex h-auto w-full justify-start overflow-x-auto bg-accent">
          <TabsTrigger value="pets">Pets</TabsTrigger>
          <TabsTrigger value="orgs">ONGs e Protetores</TabsTrigger>
          <TabsTrigger value="campaigns">Vaquinhas</TabsTrigger>
          <TabsTrigger value="missing">Desaparecidos</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="pets"><PetsTab /></TabsContent>
        <TabsContent value="orgs"><OrgsTab /></TabsContent>
        <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
        <TabsContent value="missing"><MissingTab /></TabsContent>
        <TabsContent value="chats"><ChatsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
      </Tabs>
    </div>
  );
}

const useOrgs = () =>
  useQuery({ queryKey: ["orgs"], queryFn: async () => (await supabase.from("organizations").select("*").order("name")).data ?? [] });

function PetsTab() {
  const { data: orgs = [] } = useOrgs();
  const { data = [], refetch } = useQuery({
    queryKey: ["admin-pets"],
    queryFn: async () => (await supabase.from("pets").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return <div className="grid gap-6 lg:grid-cols-2"><PetForm orgs={orgs} onSaved={() => refetch()} /><PetList pets={data} onChange={() => refetch()} /></div>;
}

function OrgsTab() {
  const { data = [], refetch } = useOrgs();
  const [f, setF] = useState({ name: "", kind: "ong" as "ong" | "protetor", document: "", phone: "", social_link: "", region: "" });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="vintage-card space-y-3 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.from("organizations").insert(f);
          if (error) return toast.error("Erro ao salvar.");
          setF({ name: "", kind: "ong", document: "", phone: "", social_link: "", region: "" });
          toast.success("Cadastrado!");
          refetch();
        }}
      >
        <h2 className="text-xl font-bold">Cadastrar ONG ou protetor</h2>
        <select className="h-9 w-full rounded-md border bg-card px-3" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as "ong" | "protetor" })}>
          <option value="ong">ONG</option><option value="protetor">Protetor Independente</option>
        </select>
        <Field label="Nome"><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="CNPJ / CPF"><Input value={f.document} onChange={(e) => setF({ ...f, document: e.target.value })} /></Field>
        <Field label="WhatsApp"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Instagram / Site"><Input value={f.social_link} onChange={(e) => setF({ ...f, social_link: e.target.value })} /></Field>
        <Field label="Região"><Input value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })} /></Field>
        <Button type="submit">Salvar</Button>
      </form>
      <ul className="vintage-card h-fit divide-y">
        {data.map((o) => (
          <li key={o.id} className="flex items-center gap-3 p-3">
            <div className="flex-1"><p className="font-bold">{o.name}</p><p className="text-xs text-muted-foreground">{o.kind === "ong" ? "ONG" : "Protetor"} · {o.region} · {o.phone}</p></div>
            <Button size="sm" variant="destructive" onClick={async () => { await supabase.from("organizations").delete().eq("id", o.id); refetch(); }}>Excluir</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CAMP_EMPTY = { title: "", description: "", goal: "", raised: "0", pix_key: "", pix_name: "Caritas Pets", pet_id: "" };

function CampaignsTab() {
  const { user } = useAuth();
  const d = useDraft("draft:campaign", CAMP_EMPTY);
  const v = d.value;
  const [file, setFile] = useState<File | null>(null);
  const { data: pets = [] } = useQuery({ queryKey: ["admin-pets-min"], queryFn: async () => (await supabase.from("pets").select("id, name").order("name")).data ?? [] });
  const { data = [], refetch } = useQuery({ queryKey: ["admin-campaigns"], queryFn: async () => (await supabase.from("campaigns").select("*").order("created_at", { ascending: false })).data ?? [] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !v.title || !v.goal || !v.pix_key) return toast.error("Preencha título, meta e chave PIX.");
    const photo_url = file ? await uploadMedia(user.id, file) : null;
    const { error } = await supabase.from("campaigns").insert({
      title: v.title, description: v.description, goal: Number(v.goal), raised: Number(v.raised) || 0,
      pix_key: v.pix_key, pix_name: v.pix_name, pet_id: v.pet_id || null, photo_url,
    });
    if (error) return toast.error("Erro ao salvar.");
    d.reset(); setFile(null); toast.success("Vaquinha criada!"); refetch();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="vintage-card space-y-3 p-5">
        <h2 className="text-xl font-bold">Nova vaquinha</h2>
        <Field label="Título"><Input value={v.title} onChange={(e) => d.update({ title: e.target.value })} /></Field>
        <Field label="Descrição"><Input value={v.description} onChange={(e) => d.update({ description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Meta (R$)"><Input inputMode="decimal" value={v.goal} onChange={(e) => d.update({ goal: e.target.value })} /></Field>
          <Field label="Já arrecadado (R$)"><Input inputMode="decimal" value={v.raised} onChange={(e) => d.update({ raised: e.target.value })} /></Field>
        </div>
        <Field label="Chave PIX" hint="CPF, CNPJ, e-mail, telefone (+5561…) ou chave aleatória"><Input value={v.pix_key} onChange={(e) => d.update({ pix_key: e.target.value })} /></Field>
        <Field label="Nome do recebedor"><Input value={v.pix_name} onChange={(e) => d.update({ pix_name: e.target.value })} /></Field>
        <Field label="Pet ligado (abre o chat do pet)">
          <select className="h-9 w-full rounded-md border bg-card px-3" value={v.pet_id} onChange={(e) => d.update({ pet_id: e.target.value })}>
            <option value="">—</option>{pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Foto"><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Enviar</Button>
          <Button type="button" variant="secondary" onClick={() => toast.success("Rascunho guardado.")}>Salvar para continuar depois</Button>
        </div>
        {d.savedLabel && <p className="text-sm italic text-primary">{d.savedLabel}</p>}
      </form>
      <ul className="vintage-card h-fit divide-y">
        {data.map((c) => <CampaignRow key={c.id} c={c} onChange={() => refetch()} />)}
      </ul>
    </div>
  );
}

function CampaignRow({ c, onChange }: { c: { id: string; title: string; raised: number; goal: number; active: boolean }; onChange: () => void }) {
  const [raised, setRaised] = useState(String(c.raised));
  return (
    <li className="space-y-2 p-3">
      <p className="font-bold">{c.title} {!c.active && <span className="text-xs italic">(encerrada)</span>}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        Arrecadado R$ <Input className="h-8 w-28" value={raised} onChange={(e) => setRaised(e.target.value)} /> de R$ {c.goal}
        <Button size="sm" onClick={async () => { await supabase.from("campaigns").update({ raised: Number(raised) }).eq("id", c.id); toast.success("Atualizado"); onChange(); }}>Salvar</Button>
        <Button size="sm" variant="outline" onClick={async () => { await supabase.from("campaigns").update({ active: !c.active }).eq("id", c.id); onChange(); }}>{c.active ? "Encerrar" : "Reabrir"}</Button>
        <Button size="sm" variant="destructive" onClick={async () => { await supabase.from("campaigns").delete().eq("id", c.id); onChange(); }}>Excluir</Button>
      </div>
    </li>
  );
}

function MissingTab() {
  const { user } = useAuth();
  const [f, setF] = useState({ name: "", location: "", description: "", contact: "" });
  const [file, setFile] = useState<File | null>(null);
  const { data = [], refetch } = useQuery({ queryKey: ["missing"], queryFn: async () => (await supabase.from("missing_pets").select("*").order("created_at", { ascending: false })).data ?? [] });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="vintage-card space-y-3 p-5" onSubmit={async (e) => {
        e.preventDefault();
        if (!user) return;
        const photo_url = file ? await uploadMedia(user.id, file) : null;
        const { error } = await supabase.from("missing_pets").insert({ ...f, photo_url });
        if (error) return toast.error("Erro ao salvar.");
        setF({ name: "", location: "", description: "", contact: "" }); setFile(null); refetch();
      }}>
        <h2 className="text-xl font-bold">Novo cartaz</h2>
        <Field label="Nome do pet"><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Onde sumiu"><Input required value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
        <Field label="Descrição"><Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Contato"><Input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></Field>
        <Field label="Foto"><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
        <Button type="submit">Publicar</Button>
      </form>
      <ul className="vintage-card h-fit divide-y">
        {data.map((m) => (
          <li key={m.id} className="flex items-center gap-3 p-3">
            <div className="flex-1"><p className="font-bold">{m.name}</p><p className="text-xs">{m.location}</p></div>
            <Button size="sm" variant="destructive" onClick={async () => { await supabase.from("missing_pets").delete().eq("id", m.id); refetch(); }}>Excluir</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatsTab() {
  const { data = [] } = useQuery({
    queryKey: ["admin-convs"],
    queryFn: async () => (await supabase.from("conversations").select("id, kind, title, last_message_at").order("last_message_at", { ascending: false })).data ?? [],
  });
  return (
    <ul className="vintage-card divide-y">
      {data.length === 0 && <li className="p-4 italic">Nenhuma conversa.</li>}
      {data.map((c) => (
        <li key={c.id}>
          <Link to="/chats/$id" params={{ id: c.id }} className="flex justify-between p-3 hover:bg-accent/50">
            <span><span className="mr-2 rounded bg-secondary px-2 text-xs">{c.kind === "support" ? "Suporte" : "Pet"}</span>{c.title}</span>
            <span className="text-xs text-muted-foreground">{new Date(c.last_message_at).toLocaleString("pt-BR")}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function UsersTab() {
  const { data = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <ul className="vintage-card divide-y">
      {data.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
          <div className="flex-1">
            <p className="font-bold">{p.name ?? p.email} <span className="ml-1 rounded bg-secondary px-2 text-xs">{p.profile_type}</span></p>
            <p className="text-muted-foreground">{p.email} · {p.phone} · {p.address ?? p.cep}</p>
          </div>
          {p.proof_path && (
            <Button size="sm" variant="outline" onClick={async () => { const u = await signedUrl("proofs", p.proof_path!); if (u) window.open(u, "_blank"); }}>
              Ver comprovante
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
