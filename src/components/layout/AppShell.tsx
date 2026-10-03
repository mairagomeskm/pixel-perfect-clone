import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { User, MessageCircle, Bell, Shield, LifeBuoy, LogOut, Lock, ListChecks } from "lucide-react";
import { FloatingHeader, NavLinks } from "@/components/layout/FloatingHeader";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AuthForms } from "@/components/AuthForms";
import { DRAFT_LABELS, clearDraft } from "@/lib/drafts";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const { user, isAdmin, authOpen, setAuthOpen, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const isHome = pathname === "/";
  const fullBleedChat = pathname.startsWith("/chats/");

  useEffect(() => {
    const k = Object.keys(DRAFT_LABELS).find((key) => localStorage.getItem(key));
    setDraftKey(k ?? null);
  }, [menuOpen, pathname]);

  const [fontStep, setFontStep] = useState(0);
  useEffect(() => { setFontStep(Number(localStorage.getItem("font-step") ?? 0)); }, []);
  useEffect(() => {
    document.documentElement.style.fontSize = `${100 + fontStep * 12.5}%`;
    localStorage.setItem("font-step", String(fontStep));
  }, [fontStep]);
  const changeFont = (d: number) => setFontStep((s) => Math.max(-1, Math.min(3, s + d)));

  const draftTarget = draftKey === "draft:census" ? "/perfil" : draftKey === "draft:campaign" ? "/admin" : "/meus-pets";

  const items: { to: string; label: string; icon: typeof User; show?: boolean }[] = [
    { to: "/perfil", label: "Editar Meu Perfil", icon: User },
    { to: "/meus-pets", label: "Gerenciar Meus Pets/Anúncios", icon: ListChecks },
    { to: "/chats", label: "Meus Chats", icon: MessageCircle },
    { to: "/notificacoes", label: "Notificações", icon: Bell },
    { to: "/privacidade", label: "Privacidade", icon: Lock },
    { to: "/ajuda", label: "Central de Ajuda", icon: LifeBuoy },
    { to: "/admin", label: "Administração", icon: Shield, show: isAdmin },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <FloatingHeader
        showBack={!isHome}
        onBack={() => router.history.back()}
        onMenu={() => setMenuOpen(true)}
        showAuth={!user}
        onAuth={() => setAuthOpen(true)}
        onFont={changeFont}
      />

      <main className={fullBleedChat ? "flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:pb-12"}>
        {children}
      </main>

      {!fullBleedChat && (
        <footer className="bg-primary px-4 pb-24 pt-8 text-center text-sm text-primary-foreground md:pb-8">
          <p>Brasília - DF | Somos uma plataforma 100% digital e independente, não possuímos sede física.</p>
          <p className="mt-2 opacity-90">
            Desenvolvido por: Letícia da Silva Lima, Letícia Krixi de Souza, Maíra Gomes Rodrigues, Sophia Abarno Lemos e
            Vitória Santana Barbosa.
          </p>
        </footer>
      )}

      {!fullBleedChat && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-primary/30 bg-background md:hidden">
          <div className="grid grid-cols-5">
            <NavLinks mobile />
          </div>
        </nav>
      )}

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-80 border-l-2 border-primary/40 bg-accent p-0 text-accent-foreground">
          <SheetTitle className="px-6 pb-2 pt-6 text-xl italic text-primary">Menu</SheetTitle>
          {draftKey && (
            <div className="mx-4 mb-3 rounded-md border border-primary/40 bg-card p-3 text-sm">
              Você tem {DRAFT_LABELS[draftKey]} em andamento. Deseja continuar?
              <div className="mt-2 flex gap-2">
                <Button size="sm" asChild onClick={() => setMenuOpen(false)}>
                  <Link to={draftTarget}>Continuar</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { clearDraft(draftKey); setDraftKey(null); }}>
                  Descartar
                </Button>
              </div>
            </div>
          )}
          <ul className="divide-y divide-primary/25 border-y border-primary/25">
            {items.filter((i) => i.show !== false).map((i) => (
              <li key={i.to}>
                <Link
                  to={i.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-3.5 hover:bg-card/60"
                >
                  <i.icon className="h-5 w-5 text-primary" /> {i.label}
                </Link>
              </li>
            ))}
            <li>
              {user ? (
                <button onClick={() => { setMenuOpen(false); signOut(); }} className="flex w-full items-center gap-3 px-6 py-3.5 hover:bg-card/60">
                  <LogOut className="h-5 w-5 text-primary" /> Sair
                </button>
              ) : (
                <button onClick={() => { setMenuOpen(false); setAuthOpen(true); }} className="flex w-full items-center gap-3 px-6 py-3.5 hover:bg-card/60">
                  <User className="h-5 w-5 text-primary" /> Entrar / Cadastrar
                </button>
              )}
            </li>
          </ul>
        </SheetContent>
      </Sheet>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogTitle className="text-2xl italic text-primary">Bem-vindo ao Carita's Pets</DialogTitle>
          <AuthForms />
        </DialogContent>
      </Dialog>
    </div>
  );
}

