import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LifeBuoy, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/chats/")({
  head: () => ({ meta: [{ title: "Meus Chats — Carita's Pets" }, { name: "description", content: "Suas conversas com protetores, adotantes e suporte." }] }),
  component: ChatsPage,
});

function ChatsPage() {
  const { data = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, kind, title, last_message_at, pets(name, photo_url)")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mt-6 rounded-lg bg-white px-4 py-2 font-bold text-3xl text-primary">Meus Chats</h1>
      {data.length === 0 && <p className="vintage-card p-6 italic">Nenhuma conversa ainda. Clique em “Tenho Interesse” em um pet!</p>}
      <ul className="vintage-card divide-y">
        {data.map((c) => (
          <li key={c.id}>
            <Link to="/chats/$id" params={{ id: c.id }} className="flex items-center gap-3 p-4 hover:bg-accent/50">
              {c.pets?.photo_url ? (
                <img src={c.pets.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  {c.kind === "support" ? <LifeBuoy className="text-primary" /> : <MessageCircle className="text-primary" />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{c.title ?? c.pets?.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.last_message_at).toLocaleString("pt-BR")}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
