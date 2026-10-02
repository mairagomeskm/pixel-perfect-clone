import { useState } from "react";
import { toast } from "sonner";
import { Heart, Building2, HandHeart, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isValidCNPJ, isValidCPF, lookupCep, maskCEP, maskCNPJ, maskCPF, maskPhone, onlyDigits,
} from "@/lib/validators";

type Kind = "adotante" | "ong" | "protetor";

export function AuthForms() {
  return (
    <div>
      <Tabs defaultValue="entrar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-sky">
          <TabsTrigger value="entrar">Entrar</TabsTrigger>
          <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
        </TabsList>
        <TabsContent value="entrar"><Login /></TabsContent>
        <TabsContent value="cadastrar"><Register /></TabsContent>
      </Tabs>
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-primary/30 bg-accent p-3 text-sm">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          <b>Privacidade Garantida:</b> Seus dados pessoais e documentos de login são criptografados, estritamente
          confidenciais e visíveis apenas para você.
        </p>
      </div>
    </div>
  );
}

function GoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={async () => {
        const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
        if (r.error) toast.error("Não foi possível entrar com o Google.");
      }}
    >
      Continuar com Google
    </Button>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4 pt-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setBusy(false);
        if (error) toast.error("E-mail ou senha incorretos, ou e-mail ainda não confirmado.");
        else toast.success("Que bom te ver!");
      }}
    >
      <Field label="E-mail"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Senha"><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      <button
        type="button"
        className="text-sm italic text-primary underline"
        onClick={async () => {
          if (!email) return toast.error("Digite seu e-mail acima primeiro.");
          await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
          toast.success("Enviamos um link para redefinir sua senha.");
        }}
      >
        Esqueci minha senha
      </button>
      <Button type="submit" className="w-full" disabled={busy}>Entrar</Button>
      <GoogleButton />
    </form>
  );
}

function Register() {
  const [kind, setKind] = useState<Kind | null>(null);
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "", cep: "", cpf: "", cnpj: "", social_link: "" });
  const [cepMsg, setCepMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  if (done)
    return (
      <div className="space-y-2 py-6 text-center">
        <p className="text-xl italic text-primary">Quase lá!</p>
        <p>Enviamos um link de confirmação para <b>{f.email}</b>. Depois de confirmar, entre e complete seu perfil com o censo e o comprovante.</p>
      </div>
    );

  if (!kind)
    return (
      <div className="space-y-3 pt-2">
        <p className="text-center">Como você quer participar?</p>
        {([
          ["adotante", "Sou Adotante", Heart],
          ["ong", "Sou uma ONG", Building2],
          ["protetor", "Sou Protetor Independente", HandHeart],
        ] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setKind(k)} className="flex w-full items-center gap-4 rounded-lg border-2 border-secondary bg-secondary/40 p-4 text-left text-lg hover:bg-secondary">
            <Icon className="h-7 w-7 text-primary" /> {label}
          </button>
        ))}
        <GoogleButton />
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password.length < 6) return toast.error("A senha precisa de pelo menos 6 caracteres.");
    if (onlyDigits(f.phone).length < 10) return toast.error("WhatsApp inválido.");
    let address: string | undefined;
    if (kind === "adotante") {
      const r = await lookupCep(f.cep);
      if (!r.ok) return setCepMsg(r.error);
      address = r.address;
    }
    if (kind === "protetor" && !isValidCPF(f.cpf)) return toast.error("CPF inválido.");
    if (kind === "ong" && !isValidCNPJ(f.cnpj)) return toast.error("CNPJ inválido.");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: f.email,
      password: f.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { profile_type: kind, name: f.name, phone: f.phone, cep: f.cep, cpf: f.cpf || null, cnpj: f.cnpj || null, social_link: f.social_link || null, address },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDone(true);
  };

  return (
    <form className="space-y-3 pt-2" onSubmit={submit}>
      <button type="button" onClick={() => setKind(null)} className="text-sm italic text-primary underline">← trocar tipo de perfil</button>
      <Field label={kind === "ong" ? "Razão Social / Nome Fantasia" : kind === "protetor" ? "Nome Completo" : "Nome"}>
        <Input required value={f.name} onChange={set("name")} />
      </Field>
      {kind === "ong" && <Field label="CNPJ"><Input required value={f.cnpj} onChange={(e) => setF({ ...f, cnpj: maskCNPJ(e.target.value) })} /></Field>}
      {kind === "protetor" && <Field label="CPF"><Input required value={f.cpf} onChange={(e) => setF({ ...f, cpf: maskCPF(e.target.value) })} /></Field>}
      <Field label="E-mail"><Input type="email" required value={f.email} onChange={set("email")} /></Field>
      <Field label="Senha"><Input type="password" required value={f.password} onChange={set("password")} /></Field>
      <Field label={kind === "ong" ? "WhatsApp da instituição" : "WhatsApp"}>
        <Input required value={f.phone} onChange={(e) => setF({ ...f, phone: maskPhone(e.target.value) })} />
      </Field>
      {kind === "adotante" && (
        <>
          <Field label="CEP" hint={cepMsg ?? "Apenas DF e entorno"}>
            <Input required value={f.cep} onChange={(e) => { setCepMsg(null); setF({ ...f, cep: maskCEP(e.target.value) }); }} />
          </Field>
          <div className="rounded-lg border-2 border-dashed border-secondary bg-secondary/20 p-3 text-sm">
            <b>Comprovante de Residência:</b> após confirmar seu e-mail, envie o arquivo em <i>Editar Meu Perfil</i> junto com o censo de adoção.
          </div>
        </>
      )}
      {kind === "ong" && <Field label="Link do Instagram/Site"><Input required value={f.social_link} onChange={set("social_link")} /></Field>}
      {kind === "protetor" && <Field label="Link de Rede Social com histórico de resgates"><Input required value={f.social_link} onChange={set("social_link")} /></Field>}
      <Button type="submit" className="w-full" disabled={busy}>Criar conta</Button>
    </form>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs italic text-muted-foreground">{hint}</p>}
    </div>
  );
}
