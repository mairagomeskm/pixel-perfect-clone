import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Carita's Pets" },
      { name: "description", content: "Defina uma nova senha para sua conta." },
      { property: "og:title", content: "Nova senha — Carita's Pets" },
      { property: "og:description", content: "Redefinição de senha." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  return (
    <form
      className="vintage-card mx-auto max-w-md space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.updateUser({ password: pw });
        if (error) return toast.error(error.message);
        toast.success("Senha atualizada!");
        navigate({ to: "/" });
      }}
    >
      <h1 className="mt-6 rounded-lg bg-white px-4 py-2 font-bold text-3xl text-primary">Defina sua nova senha</h1>
      <Input type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} />
      <Button type="submit" className="w-full">Salvar</Button>
    </form>
  );
}
