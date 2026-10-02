import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade — Carita's Pets" },
      { name: "description", content: "Blog público do Carita's Pets: ONGs parceiras, finais felizes e dicas de cuidados com pets." },
      { property: "og:title", content: "Comunidade Carita's — Blog público" },
      { property: "og:description", content: "Transparência e acompanhamento: ONGs parceiras, finais felizes e dicas de cuidados." },
    ],
  }),
  component: ComunidadePage,
});

const CATS = ["Conheça nossas ONGs parceiras", "Finais Felizes", "Dicas de Cuidados"] as const;
type Cat = (typeof CATS)[number];
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`;

const POSTS: { cat: Cat; title: string; summary: string; photo: string; tall?: boolean }[] = [
  { cat: "Conheça nossas ONGs parceiras", title: "Um abrigo cheio de histórias", summary: "Conheça o trabalho de resgate, castração e lar temporário feito por voluntários no DF.", photo: img("photo-1601758228041-f3b2795255f1"), tall: true },
  { cat: "Finais Felizes", title: "Do resgate ao sofá", summary: "Acompanhe a adaptação de um cãozinho resgatado na sua primeira semana no novo lar.", photo: img("photo-1587300003388-59208cc962cb") },
  { cat: "Dicas de Cuidados", title: "Telas de proteção salvam vidas", summary: "Por que janelas e varandas teladas são indispensáveis para quem tem gatos.", photo: img("photo-1514888286974-6c03e2ca1dba") },
  { cat: "Finais Felizes", title: "Duas gatinhas, um só lar", summary: "Irmãs adotadas juntas mostram como a convivência ajuda na adaptação.", photo: img("photo-1573865526739-10659fec78a5"), tall: true },
  { cat: "Dicas de Cuidados", title: "Carteirinha de vacinas em dia", summary: "V8/V10, antirrábica e vermífugo: o calendário básico do primeiro ano.", photo: img("photo-1583337130417-3346a1be7dee") },
  { cat: "Conheça nossas ONGs parceiras", title: "Voluntariado que transforma", summary: "Como ajudar ONGs mesmo sem adotar: doações, transporte e lar temporário.", photo: img("photo-1450778869180-41d0601e046e") },
];

function ComunidadePage() {
  const [cat, setCat] = useState<Cat | "Todos">("Todos");
  const list = POSTS.filter((p) => cat === "Todos" || p.cat === cat);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl italic text-primary">Comunidade Carita's</h1>
        <p className="text-muted-foreground">Acompanhamento público e transparência da nossa rede.</p>
      </header>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {(["Todos", ...CATS] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border border-primary/40 px-4 py-1.5 ${cat === c ? "bg-primary text-primary-foreground" : "bg-accent"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {list.map((p) => (
          <article key={p.title} className="vintage-card mb-5 break-inside-avoid overflow-hidden">
            <img src={p.photo} alt={p.title} loading="lazy" className={`w-full object-cover ${p.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`} />
            <div className="p-4">
              <span className="inline-block rounded-full bg-secondary px-3 py-0.5 text-xs">{p.cat}</span>
              <h2 className="mt-2 text-xl font-bold">{p.title}</h2>
              <p className="text-sm text-muted-foreground">{p.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
