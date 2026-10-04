import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AuthForms } from "@/components/AuthForms";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou cadastrar — Carita's Pets" },
      { name: "description", content: "Entre ou crie sua conta de adotante, ONG ou protetor independente." },
      { property: "og:title", content: "Entrar — Carita's Pets" },
      { property: "og:description", content: "Acesse sua conta no Carita's Pets." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return (
    <div className="vintage-card mx-auto max-w-md p-6">
      <h1 className="mb-4 mt-6 rounded-lg bg-blush px-4 py-2 font-bold text-3xl text-primary">Entre para continuar</h1>
      <AuthForms />
    </div>
  );
}
