import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { openSupportChat } from "@/lib/chat";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Central de Ajuda e Suporte — Carita's Pets" },
      { name: "description", content: "Perguntas frequentes e chat de suporte com a equipe do Carita's Pets." },
      { property: "og:title", content: "Central de Ajuda — Carita's Pets" },
      { property: "og:description", content: "Fale com a equipe do Carita's Pets." },
    ],
  }),
  component: AjudaPage,
});

function AjudaPage() {
  const { user, setAuthOpen } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="mt-6 rounded-lg bg-blush px-4 py-2 font-bold text-3xl text-primary">Central de Ajuda</h1>
      <div className="vintage-card space-y-3 bg-accent p-6">
        <h2 className="text-xl font-bold">Suporte com a equipe</h2>
        <p>Converse diretamente com as criadoras do Carita's Pets.</p>
        <Button
          onClick={async () => {
            if (!user) return setAuthOpen(true);
            try {
              const id = await openSupportChat(user.id);
              navigate({ to: "/chats/$id", params: { id } });
            } catch { toast.error("Não foi possível abrir o suporte."); }
          }}
        >
          Abrir chat de suporte
        </Button>
      </div>
      <Accordion type="single" collapsible className="vintage-card px-6">
        {([
          ["Como adoto um pet?", "Na aba Adoção, clique em “Tenho Interesse”. Um chat abre com o protetor e algumas perguntas rápidas."],
          ["Preciso enviar comprovante?", "Sim. Envie em Editar Meu Perfil junto com o censo de adoção."],
          ["Como funcionam as vaquinhas?", "Cada campanha tem uma chave PIX própria. O valor vai direto para o responsável pelo pet."],
          ["Atendem fora do DF?", "Atendemos o DF e o entorno."],
        ] as [string, string][]).map(([q, a]) => (
          <AccordionItem key={q} value={q}>
            <AccordionTrigger>{q}</AccordionTrigger>
            <AccordionContent>{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
