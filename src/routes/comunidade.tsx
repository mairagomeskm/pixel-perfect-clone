import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { uploadMedia } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterPill } from "@/components/FilterPill";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade — Carita's Pets" },
      { name: "description", content: "Mural da comunidade Carita's Pets: finais felizes, ONGs parceiras e dicas de cuidados com pets." },
      { property: "og:title", content: "Comunidade Carita's — Mural público" },
      { property: "og:description", content: "Finais felizes de pets adotados, ONGs parceiras e dicas de cuidados no DF." },
    ],
  }),
  component: ComunidadePage,
});

const CATS = ["Finais Felizes", "Conheça nossas ONGs parceiras", "Dicas de Cuidados"] as const;
type Cat = (typeof CATS)[number];
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`;

const ARTICLES: { cat: Cat; title: string; summary: string; photo: string }[] = [
  { cat: "Conheça nossas ONGs parceiras", title: "Um abrigo cheio de histórias", summary: "Conheça o trabalho de resgate, castração e lar temporário feito por voluntários no DF.", photo: img("photo-1601758228041-f3b2795255f1") },
  { cat: "Dicas de Cuidados", title: "Telas de proteção salvam vidas", summary: "Por que janelas e varandas teladas são indispensáveis para quem tem gatos.", photo: img("photo-1514888286974-6c03e2ca1dba") },
  { cat: "Dicas de Cuidados", title: "Carteirinha de vacinas em dia", summary: "V8/V10, antirrábica e vermífugo: o calendário básico do primeiro ano.", photo: img("photo-1583337130417-3346a1be7dee") },
  { cat: "Conheça nossas ONGs parceiras", title: "Voluntariado que transforma", summary: "Como ajudar ONGs mesmo sem adotar: doações, transporte e lar temporário.", photo: img("photo-1450778869180-41d0601e046e") },
];

type Post = { id: string; pet_id: string; media_url: string; media_type: string; caption: string | null; created_at: string; pets: { name: string; photo_url: string | null } | null };
type FeedItem = { kind: "post"; post: Post } | { kind: "article"; a: (typeof ARTICLES)[number] };

function ComunidadePage() {
  const { user, setAuthOpen } = useAuth();
  const qc = useQueryClient();
  const [cat, setCat] = useState<Cat | "Todos">("Todos");
  const [seen, setSeen] = useState<string[]>([]);
  const [viewer, setViewer] = useState<{ posts: Post[]; i: number } | null>(null);

  useEffect(() => setSeen(JSON.parse(localStorage.getItem("diary-seen") ?? "[]")), []);
  const markSeen = (id: string) =>
    setSeen((s) => {
      if (s.includes(id)) return s;
      const n = [...s, id];
      localStorage.setItem("diary-seen", JSON.stringify(n));
      return n;
    });

  const { data: posts = [] } = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("diary_posts").select("*, pets(name, photo_url)").order("created_at", { ascending: true });
      if (error) throw error;
      return data as Post[];
    },
  });
  const { data: adopted = [] } = useQuery({
    queryKey: ["pets", "adotado"],
    queryFn: async () => (await supabase.from("pets").select("id, name").eq("status", "adotado")).data ?? [],
  });

  const groups = useMemo(() => {
    const m = new Map<string, Post[]>();
    posts.forEach((p) => m.set(p.pet_id, [...(m.get(p.pet_id) ?? []), p]));
    return [...m.values()];
  }, [posts]);

  const feed = useMemo(() => {
    const ps: FeedItem[] = [...posts].reverse().filter((p) => p.media_type === "image").map((post) => ({ kind: "post", post }));
    const as: FeedItem[] = ARTICLES.map((a) => ({ kind: "article", a }));
    const out: FeedItem[] = [];
    // intercala: 2 atualizações, 1 artigo
    while (ps.length || as.length) {
      out.push(...ps.splice(0, 2));
      if (as.length) out.push(as.shift()!);
    }
    return out.filter((f) =>
      cat === "Todos" || (f.kind === "post" ? cat === "Finais Felizes" : f.a.cat === cat),
    );
  }, [posts, cat]);

  const current = viewer ? viewer.posts[viewer.i] : null;
  useEffect(() => {
    if (!current) return;
    markSeen(current.id);
    const t = setTimeout(() => setViewer((v) => (v && v.i < v.posts.length - 1 ? { ...v, i: v.i + 1 } : null)), 5000);
    return () => clearTimeout(t);
  }, [current]);

  const [form, setForm] = useState<{ pet: string; caption: string; file: File | null }>({ pet: "", caption: "", file: null });
  const [busy, setBusy] = useState(false);
  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setAuthOpen(true);
    if (!form.pet || !form.file) return toast.error("Escolha o pet e a foto ou vídeo.");
    setBusy(true);
    try {
      const url = await uploadMedia(user.id, form.file);
      const { error } = await supabase.from("diary_posts").insert({
        pet_id: form.pet, author_id: user.id, media_url: url, caption: form.caption || null,
        media_type: form.file.type.startsWith("video") ? "video" : "image",
      });
      if (error) throw error;
      toast.success("Atualização publicada! O protetor será avisado.");
      setForm({ pet: "", caption: "", file: null });
      qc.invalidateQueries({ queryKey: ["diary"] });
    } catch {
      toast.error("Não foi possível publicar.");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl italic text-primary">Comunidade Carita's</h1>
        <p className="text-muted-foreground">Um mural de finais felizes, parceiros e cuidados.</p>
      </header>

      <form onSubmit={publish} className="relative mx-auto max-w-2xl space-y-3 rounded-3xl border-2 border-secondary bg-card p-5 shadow-md">
        <h2 className="text-xl font-bold italic text-primary">Compartilhe uma novidade do seu pet</h2>
        <select className="w-full rounded-full border bg-card px-4 py-2" value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} aria-label="Pet adotado">
          <option value="">Qual pet você adotou?</option>
          {adopted.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Input type="file" accept="image/*,video/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
        <Input placeholder="Conte como ele está…" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        <Button type="submit" className="rounded-full" disabled={busy}>{user ? "Publicar" : "Entre para publicar"}</Button>
      </form>

      {groups.length > 0 && (
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {groups.map((g) => {
            const unseen = g.some((p) => !seen.includes(p.id));
            const first = g[0]!; const pet = first.pets;
            return (
              <button key={first.pet_id} onClick={() => setViewer({ posts: g, i: 0 })} className="flex shrink-0 flex-col items-center gap-1">
                <span className={`rounded-full p-[3px] ${unseen ? "bg-secondary" : "bg-border"}`}>
                  <img src={pet?.photo_url ?? first.media_url} alt={pet?.name ?? ""} className="h-20 w-20 rounded-full border-4 border-card object-cover" />
                </span>
                <span className="text-sm">{pet?.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-2">
        {(["Todos", ...CATS] as const).map((c) => (
          <FilterPill key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterPill>
        ))}
      </div>

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {feed.length === 0 && <p className="italic text-muted-foreground">Ainda não há publicações aqui.</p>}
        {feed.map((f) =>
          f.kind === "post" ? (
            <figure key={f.post.id} className="polaroid mb-5 break-inside-avoid">
              <img src={f.post.media_url} alt={f.post.caption ?? ""} loading="lazy" className="aspect-square w-full object-cover" />
              <figcaption className="mt-2 text-center text-sm italic">
                <span className="mb-1 block"><span className="rounded-full bg-secondary px-3 py-0.5 text-xs not-italic">Finais Felizes</span></span>
                {f.post.pets?.name}{f.post.caption ? ` — ${f.post.caption}` : ""}
              </figcaption>
            </figure>
          ) : (
            <article key={f.a.title} className="vintage-card mb-5 break-inside-avoid overflow-hidden">
              <img src={f.a.photo} alt={f.a.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <span className="inline-block rounded-full bg-sky px-3 py-0.5 text-xs">{f.a.cat}</span>
                <h2 className="mt-2 text-xl font-bold">{f.a.title}</h2>
                <p className="text-sm text-muted-foreground">{f.a.summary}</p>
              </div>
            </article>
          ),
        )}
      </div>

      {current && viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={() => setViewer(null)}>
          <div className="relative h-full max-h-[90vh] w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-x-2 top-2 z-10 flex gap-1">
              {viewer.posts.map((p, i) => (
                <div key={p.id} className="h-1 flex-1 overflow-hidden rounded bg-cream/40">
                  <div key={current.id} className={`h-full bg-cream ${i < viewer.i ? "w-full" : i === viewer.i ? "animate-story" : "w-0"}`} />
                </div>
              ))}
            </div>
            <button onClick={() => setViewer(null)} aria-label="Fechar" className="absolute right-2 top-5 z-10 text-cream"><X /></button>
            <div className="flex h-full items-center justify-center" onClick={() => setViewer((v) => v && (v.i < v.posts.length - 1 ? { ...v, i: v.i + 1 } : null))}>
              {current.media_type === "video" ? (
                <video src={current.media_url} autoPlay muted playsInline className="max-h-full w-full object-contain" />
              ) : (
                <div className="polaroid w-[90%]"><img src={current.media_url} alt="" className="aspect-[3/4] w-full object-cover" />
                  <p className="mt-2 text-center italic">{current.caption}</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
