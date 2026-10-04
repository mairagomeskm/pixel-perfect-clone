import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desaparecidos")({
  head: () => ({
    meta: [
      { title: "Desaparecidos — Carita's Pets" },
      { name: "description", content: "Cartazes de pets perdidos no DF. Compartilhe e ajude a trazê-los de volta." },
      { property: "og:title", content: "Pets desaparecidos no DF — Carita's Pets" },
      { property: "og:description", content: "Ajude a encontrar cães e gatos perdidos no Distrito Federal." },
    ],
  }),
  component: DesaparecidosPage,
});

function DesaparecidosPage() {
  const { data } = useQuery({
    queryKey: ["missing"],
    queryFn: async () => {
      const { data, error } = await supabase.from("missing_pets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const share = async (name: string, location: string) => {
    const text = `PROCURA-SE: ${name}, visto pela última vez em ${location}. Ajude pelo Carita's Pets!`;
    if (navigator.share) await navigator.share({ title: `Procura-se ${name}`, text, url: window.location.href }).catch(() => {});
    else { await navigator.clipboard.writeText(`${text} ${window.location.href}`); toast.success("Texto copiado para compartilhar!"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="mt-6 rounded-lg bg-blush px-4 py-2 font-bold text-3xl text-primary">Desaparecidos</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((m) => (
          <article key={m.id} className="wanted rounded-lg p-4 text-center">
            <p className="text-3xl font-bold uppercase tracking-widest text-destructive">Procura-se</p>
            {m.photo_url && <img src={m.photo_url} alt={m.name} loading="lazy" className="my-3 aspect-square w-full rounded object-cover sepia-[.2]" />}
            <h3 className="text-2xl font-bold">{m.name}</h3>
            <p className="flex items-center justify-center gap-1 text-sm"><MapPin className="h-4 w-4" /> {m.location}</p>
            {m.description && <p className="mt-1 text-sm italic">{m.description}</p>}
            {m.contact && <p className="mt-1 text-sm">Contato: <b>{m.contact}</b></p>}
            <Button className="mt-3" onClick={() => share(m.name, m.location)}><Share2 className="h-4 w-4" /> Compartilhar</Button>
          </article>
        ))}
      </div>
    </div>
  );
}
