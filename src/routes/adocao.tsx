import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { openPetChat } from "@/lib/chat";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/adocao")({
  head: () => ({
    meta: [
      { title: "Adoção — Carita's Pets" },
      { name: "description", content: "Cães, gatos e filhotes disponíveis para adoção em todas as regiões do DF." },
      { property: "og:title", content: "Pets para adoção no DF — Carita's Pets" },
      { property: "og:description", content: "Encontre filhotes, cães e gatos para adotar perto de você." },
    ],
  }),
  component: AdocaoPage,
});

import { REGIONS } from "@/lib/regions";

function AdocaoPage() {
  const [filter, setFilter] = useState<"todos" | "filhotes" | "gato" | "cao">("todos");
  const [region, setRegion] = useState("Todas");
  const { user, setAuthOpen } = useAuth();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);

  const { data: pets, isLoading } = useQuery({
    queryKey: ["pets", "disponivel"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("pets").select("*").eq("status", "disponivel").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const list = (pets ?? []).filter(
    (p) =>
      (filter === "todos" || (filter === "filhotes" ? p.is_puppy : p.species === filter)) &&
      (region === "Todas" || p.region === region),
  );

  const interest = async (id: string, name: string) => {
    if (!user) return setAuthOpen(true);
    const { data: prof } = await supabase.from("profiles").select("avatar_url, proof_path").eq("id", user.id).single();
    if (!prof?.avatar_url || !prof?.proof_path) return setBlocked(true);
    try {
      const cid = await openPetChat(user.id, id, name);
      navigate({ to: "/chats/$id", params: { id: cid } });
    } catch {
      toast.error("Não foi possível abrir o chat.");
    }
  };

  if (!user)
    return (
      <div className="mx-auto max-w-xl rounded-xl border-2 border-primary/30 bg-secondary p-8 text-center shadow-md">
        <h1 className="text-3xl italic text-primary">Catálogo de adoção</h1>
        <p className="mt-3 text-lg">
          Para garantir a segurança dos nossos animais, o catálogo de adoção é restrito. Faça login ou cadastre-se para conhecer os pets!
        </p>
        <Button className="mt-5" size="lg" onClick={() => setAuthOpen(true)}>Entrar / Cadastrar</Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <Dialog open={blocked} onOpenChange={setBlocked}>
        <DialogContent>
          <DialogTitle className="text-2xl italic text-primary">Complete seu perfil</DialogTitle>
          <p>Para enviar mensagens a ONGs e Protetores, você precisa preencher seu perfil completo (Foto e Comprovante de Residência).</p>
          <Button asChild onClick={() => setBlocked(false)}><Link to="/perfil">Completar meu perfil</Link></Button>
        </DialogContent>
      </Dialog>
      <h1 className="text-3xl italic text-primary">Pets para adoção</h1>
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4">
        {([["todos", "Todos"], ["filhotes", "Filhotes"], ["gato", "Gatos"], ["cao", "Cães"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 rounded-full border border-primary/40 px-4 py-1.5 ${filter === k ? "bg-primary text-primary-foreground" : "bg-accent"}`}
          >
            {l}
          </button>
        ))}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="shrink-0 rounded-full border border-primary/40 bg-accent px-4 py-1.5"
          aria-label="Região do DF"
        >
          {REGIONS.map((r) => <option key={r}>{r === "Todas" ? "Região do DF" : r}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-80" />)}</div>
      ) : list.length === 0 ? (
        <p className="vintage-card p-8 text-center italic">Nenhum pet encontrado com esses filtros.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <article key={p.id} className="vintage-card relative overflow-hidden">
              <img src={p.photo_url ?? ""} alt={p.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4 pb-16">
                <h3 className="text-2xl font-bold">{p.name}</h3>
                <p className="text-muted-foreground">{p.age_label} · {p.region}</p>
                {p.description && <p className="mt-1 text-sm">{p.description}</p>}
              </div>
              <button
                onClick={() => interest(p.id, p.name)}
                className="absolute bottom-4 right-4 rounded-full bg-secondary px-5 py-2 font-bold text-secondary-foreground shadow-md hover:brightness-95"
              >
                Tenho Interesse
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
