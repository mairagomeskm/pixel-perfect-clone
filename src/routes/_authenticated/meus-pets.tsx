import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PetForm } from "@/components/PetForm";
import { PetList } from "@/components/PetList";

export const Route = createFileRoute("/_authenticated/meus-pets")({
  head: () => ({ meta: [{ title: "Meus Pets e Anúncios — Carita's Pets" }, { name: "description", content: "Gerencie os pets que você anunciou para adoção." }] }),
  component: MeusPets,
});

function MeusPets() {
  const { user } = useAuth();
  const { data = [], refetch } = useQuery({
    queryKey: ["my-pets", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("pets").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl italic text-primary">Gerenciar Meus Pets</h1>
      <PetForm onSaved={() => refetch()} />
      <PetList pets={data} onChange={() => refetch()} />
    </div>
  );
}
