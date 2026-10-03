import { Link } from "@tanstack/react-router";
import { ArrowLeft, Menu, Home, PawPrint, HandCoins, Search, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg.asset.json";

type Props = {
  showBack: boolean;
  onBack: () => void;
  onMenu: () => void;
  showAuth: boolean;
  onAuth: () => void;
  onFont: (delta: number) => void;
};

export function FloatingHeader({ showBack, onBack, onMenu, showAuth, onAuth, onFont }: Props) {
  return (
    <header className="sticky top-3 z-40 mx-3 mt-3 md:mx-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 rounded-full border border-primary/20 bg-background/90 px-3 shadow-md backdrop-blur-md">
        {showBack && (
          <button onClick={onBack} aria-label="Voltar" className="flex h-11 w-11 items-center justify-center rounded-full text-primary hover:bg-accent">
            <ArrowLeft className="h-6 w-6" strokeWidth={1.5} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold italic tracking-tight text-primary">
          <img src={logo.url} alt="Logo Carita's Pets" className="h-11 w-11 rounded-full object-cover" />
          <span className="hidden sm:inline">Carita's Pets</span>
        </Link>
        <nav className="ml-6 hidden gap-5 lg:flex">
          <NavLinks />
        </nav>
        <div className="mx-auto flex items-center gap-1 rounded-full border border-primary/30 bg-card px-1" role="group" aria-label="Tamanho do texto">
          <button onClick={() => onFont(-1)} aria-label="Diminuir texto" className="h-9 min-w-9 rounded-full px-2 font-bold text-primary hover:bg-accent">A-</button>
          <button onClick={() => onFont(1)} aria-label="Aumentar texto" className="h-9 min-w-9 rounded-full px-2 text-lg font-bold text-primary hover:bg-accent">A+</button>
        </div>
        <div className="flex items-center gap-2">
          {showAuth && <Button size="sm" className="rounded-full" onClick={onAuth}>Entrar / Cadastrar</Button>}
          <button aria-label="Abrir menu" onClick={onMenu} className="flex h-11 w-11 items-center justify-center rounded-full text-primary hover:bg-accent">
            <Menu className="h-7 w-7" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function NavLinks({ mobile }: { mobile?: boolean }) {
  const links = [
    { to: "/", label: "Início", icon: Home },
    { to: "/adocao", label: "Adoção", icon: PawPrint },
    { to: "/vaquinhas", label: "Vaquinhas", icon: HandCoins },
    { to: "/desaparecidos", label: "Desaparecidos", icon: Search },
    { to: "/comunidade", label: "Comunidade", icon: Newspaper },
  ] as const;
  return (
    <>
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          activeOptions={{ exact: l.to === "/" }}
          className={
            mobile
              ? "flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground data-[status=active]:text-primary data-[status=active]:font-bold"
              : "text-muted-foreground hover:text-primary data-[status=active]:font-bold data-[status=active]:text-primary"
          }
        >
          {mobile && <l.icon className="h-5 w-5" />}
          {l.label}
        </Link>
      ))}
    </>
  );
}
