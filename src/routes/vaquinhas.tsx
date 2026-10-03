import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { pixPayload } from "@/lib/pix";
import { useAuth } from "@/hooks/use-auth";
import { openPetChat } from "@/lib/chat";

export const Route = createFileRoute("/vaquinhas")({
  head: () => ({
    meta: [
      { title: "Vaquinhas — Carita's Pets" },
      { name: "description", content: "Ajude com cirurgias, ração e tratamentos de pets resgatados no DF via PIX." },
      { property: "og:title", content: "Vaquinhas solidárias — Carita's Pets" },
      { property: "og:description", content: "Doe via PIX para campanhas de pets resgatados no DF." },
    ],
  }),
  component: VaquinhasPage,
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function VaquinhasPage() {
  const [pix, setPix] = useState<{ key: string; name: string; title: string } | null>(null);
  const [amount, setAmount] = useState("");
  const { user, setAuthOpen } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*, pets(id, name)").eq("active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const code = pix ? pixPayload({ key: pix.key, name: pix.name, amount: Number(amount.replace(",", ".")) || undefined }) : "";

  return (
    <div className="space-y-6">
      <h1 className="mt-6 rounded-lg bg-white px-4 py-2 font-bold text-3xl text-primary">Vaquinhas</h1>
      <div className="grid gap-5 md:grid-cols-2">
        {(data ?? []).map((c) => {
          const pct = c.goal > 0 ? Math.min(100, (Number(c.raised) / Number(c.goal)) * 100) : 0;
          return (
            <article key={c.id} className="vintage-card overflow-hidden">
              {c.photo_url && <img src={c.photo_url} alt={c.title} loading="lazy" className="aspect-video w-full object-cover" />}
              <div className="space-y-3 p-5">
                <h3 className="text-2xl font-bold">{c.title}</h3>
                {c.description && <p>{c.description}</p>}
                <div className="h-4 overflow-hidden rounded-full border border-primary/40 bg-accent">
                  <div className="h-full bg-secondary" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-sm"><b>{brl(Number(c.raised))}</b> arrecadados de {brl(Number(c.goal))}</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => { setAmount(""); setPix({ key: c.pix_key, name: c.pix_name, title: c.title }); }} disabled={!c.pix_key}>
                    Doar via PIX
                  </Button>
                  {c.pets && (
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        if (!user) return setAuthOpen(true);
                        const id = await openPetChat(user.id, c.pets!.id, c.pets!.name);
                        navigate({ to: "/chats/$id", params: { id } });
                      }}
                    >
                      Conversar sobre {c.pets.name}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={!!pix} onOpenChange={(o) => !o && setPix(null)}>
        <DialogContent>
          <DialogTitle className="italic text-primary">Doar para: {pix?.title}</DialogTitle>
          <Input placeholder="Valor (opcional), ex: 25,00" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
          <div className="mx-auto rounded-lg bg-card p-3">
            <QRCodeSVG value={code} size={210} />
          </div>
          <p className="break-all rounded bg-muted p-2 text-xs">{code}</p>
          <Button onClick={() => { navigator.clipboard.writeText(code); toast.success("Código PIX copiado!"); }}>
            Copiar PIX copia e cola
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
