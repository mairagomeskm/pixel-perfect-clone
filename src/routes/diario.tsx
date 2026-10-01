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

export const Route = createFileRoute("/diario")({
  head: () => ({
    meta: [
      { title: "Diário do Pet — Finais Felizes | Carita's Pets" },
      { name: "description", content: "Acompanhe o dia a dia dos pets adotados pelo Carita's Pets em formato de stories." },
      { property: "og:title", content: "Finais Felizes — Diário do Pet" },
      { property: "og:description", content: "Stories dos pets adotados no DF." },
    ],
  }),
  component: DiarioPage,
});

type Post = { id: string; pet_id: string; media_url: string; media_type: string; caption: string | null; created_at: string; pets: { name: string; photo_url: string | null } | null };

function DiarioPage() {
  const { user, setAuthOpen } = useAuth();
  const qc = useQueryClient();
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

  const current = viewer ? viewer.posts[viewer.i] : null;
  useEffect(() => {
    if (!current) return;
    markSeen(current.id);
    const t = setTimeout(() => {
      setViewer((v) => (v && v.i < v.posts.length - 1 ? { ...v, i: v.i + 1 } : null));
    }, 5000);
    return () => clearTimeout(t);
  }, [current]);

  const [form, setForm] = useState<{ pet: string; caption: string; file: File | null }>({ pet: "", caption: "", file: null });
  const [busy, setBusy] = useState(false);
  const post = async (e: React.FormEvent) => {
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
      <h1 className="text-3xl italic text-primary">Finais Felizes · Diário do Pet</h1>

      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {groups.length === 0 && <p className="italic text-muted-foreground">Ainda não há stories. Seja o primeiro a postar!</p>}
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

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {[...posts].reverse().filter((p) => p.media_type === "image").map((p, i) => (
          <figure key={p.id} className={`polaroid ${i % 2 ? "rotate-2" : "-rotate-2"}`}>
            <img src={p.media_url} alt={p.caption ?? ""} loading="lazy" className="aspect-square w-full object-cover" />
            <figcaption className="mt-2 text-center text-sm italic">{p.pets?.name}{p.caption ? ` — ${p.caption}` : ""}</figcaption>
          </figure>
        ))}
      </div>

      <form onSubmit={post} className="vintage-card max-w-lg space-y-3 p-5">
        <h2 className="text-xl font-bold">Compartilhe uma novidade</h2>
        <select className="w-full rounded-md border bg-card px-3 py-2" value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })}>
          <option value="">Qual pet você adotou?</option>
          {adopted.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Input type="file" accept="image/*,video/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
        <Input placeholder="Legenda" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        <Button type="submit" disabled={busy}>{user ? "Publicar" : "Entre para publicar"}</Button>
      </form>

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
