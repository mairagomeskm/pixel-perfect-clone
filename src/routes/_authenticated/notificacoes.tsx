import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — Carita's Pets" }, { name: "description", content: "Suas notificações do Carita's Pets." }] }),
  component: NotifPage,
});

function NotifPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const markAll = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="mt-6 rounded-lg bg-blush px-4 py-2 font-bold text-3xl text-primary">Notificações</h1>
        <Button variant="outline" size="sm" onClick={markAll}>Marcar todas como lidas</Button>
      </div>
      {data.length === 0 && <p className="vintage-card p-6 italic">Nada por aqui ainda.</p>}
      <ul className="space-y-2">
        {data.map((n) => (
          <li key={n.id} className={`vintage-card p-4 ${n.read ? "" : "border-secondary bg-secondary/20"}`}>
            <p className="font-bold">{n.title}</p>
            {n.body && <p>{n.body}</p>}
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{new Date(n.created_at).toLocaleString("pt-BR")}</span>
              {n.link === "/diario" && <Link to="/comunidade" className="underline">ver</Link>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
