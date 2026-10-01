import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MessageCircle, HeartHandshake, ShieldCheck, Home, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-pets.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Carita's Pets — Encontre seu novo melhor amigo no DF" },
      { name: "description", content: "Adote cães e gatos no Distrito Federal, apoie vaquinhas e ajude a encontrar pets desaparecidos." },
      { property: "og:title", content: "Carita's Pets — Adoção de animais no DF" },
      { property: "og:description", content: "Adote, doe e ajude pets desaparecidos no Distrito Federal." },
    ],
  }),
  component: Index,
});

function Index() {
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
            <Button size="lg" asChild><Link to="/adocao">Ver Pets Disponíveis</Link></Button>
          </div>
        </div>
        <img src={hero} alt="Cachorro e gato numa varanda em Brasília" width={1536} height={1024} className="h-full w-full object-cover" />
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

      <section className="rounded-lg bg-primary px-6 py-8 text-primary-foreground">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[["+500", "Pets Adotados"], ["20", "ONGs parceiras"], ["+80", "Protetores"], ["R$ 45 mil", "Arrecadados"]].map(([n, l]) => (
            <div key={l}>
              <p className="text-3xl font-bold italic">{n}</p>
              <p className="text-sm opacity-90">{l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
