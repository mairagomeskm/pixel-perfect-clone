import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Search, MessageCircle, HeartHandshake, ShieldCheck, Home, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";
const hero = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Carita's Pets — Encontre seu novo melhor amigo no DF" },
      { name: "description", content: "Adote cães e gatos no Distrito Federal, apoie vaquinhas e ajude a encontrar pets desaparecidos." },
      { property: "og:title", content: "Carita's Pets — Adoção de animais no DF" },
      { property: "og:description", content: "Adote, doe e ajude pets desaparecidos no Distrito Federal." },
      { property: "og:image", content: hero },
      { name: "twitter:image", content: hero },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, setAuthOpen } = useAuth();
  const navigate = useNavigate();
  const seePets = () => (user ? navigate({ to: "/adocao" }) : setAuthOpen(true));
  return (
    <div className="space-y-14">
      <section className="vintage-card grid overflow-hidden md:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Brasília · DF</p>
          <h1 className="text-4xl font-bold italic leading-tight text-primary md:text-5xl">
            Encontre seu novo melhor amigo no DF
          </h1>
          <p className="text-lg">Cães e gatos resgatados por ONGs e protetores esperando um lar cheio de carinho.</p>
          <div>
            <Button size="lg" onClick={seePets}>Ver Pets Disponíveis</Button>
          </div>
        </div>
        <img src={hero} alt="Dois cachorros correndo juntos num gramado" className="h-full w-full object-cover" />
      </section>

      <section>
        <h2 className="mb-6 text-center text-3xl italic text-primary">Como funciona</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [Search, "1. Busque", "Filtre por espécie, idade e região do DF."],
            [MessageCircle, "2. Conecte-se", "Converse direto com a ONG ou protetor."],
            [HeartHandshake, "3. Adote", "Leve seu novo amigo para casa com segurança."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Search;
            return (
              <div key={t as string} className="vintage-card p-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <I className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t as string}</h3>
                <p className="text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-3xl italic text-primary">Dicas de posse responsável</h2>
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:grid sm:grid-cols-3">
          {[
            [ShieldCheck, "Importância das telas de proteção", "Janelas e varandas teladas evitam quedas e fugas, especialmente de gatos."],
            [Home, "Adaptação", "Dê um cantinho tranquilo e paciência nas primeiras semanas."],
            [Syringe, "Vacinas", "Mantenha a carteirinha em dia: V8/V10, antirrábica e vermífugo."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Home;
            return (
              <div key={t as string} className="min-w-64 snap-start rounded-lg border border-primary/30 bg-accent p-5">
                <I className="mb-2 h-6 w-6 text-primary" />
                <h3 className="font-bold">{t as string}</h3>
                <p className="text-sm">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
