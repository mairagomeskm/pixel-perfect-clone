import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade — Carita's Pets" },
      { name: "description", content: "Como o Carita's Pets cuida dos seus dados pessoais." },
      { property: "og:title", content: "Política de Privacidade — Carita's Pets" },
      { property: "og:description", content: "Seus dados protegidos no Carita's Pets." },
    ],
  }),
  component: () => (
    <article className="vintage-card mx-auto max-w-2xl space-y-4 p-8">
      <h1 className="mt-6 rounded-lg bg-blush px-4 py-2 font-bold text-3xl text-primary">Privacidade</h1>
      <p>Seus dados (CPF, endereço, comprovante de residência e respostas do censo) são usados apenas para avaliar adoções com segurança.</p>
      <p>Comprovantes e anexos do chat ficam guardados de forma privada: só você, as pessoas da conversa e a equipe administradora podem vê-los.</p>
      <p>Você pode editar seus dados a qualquer momento em <i>Editar Meu Perfil</i> ou pedir a exclusão pela Central de Ajuda.</p>
    </article>
  ),
});
