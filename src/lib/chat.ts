import { supabase } from "@/integrations/supabase/client";

/** Abre (ou reaproveita) a conversa do adotante sobre um pet. */
export async function openPetChat(userId: string, petId: string, petName: string) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("kind", "pet")
    .eq("pet_id", petId)
    .eq("adopter_id", userId)
    .maybeSingle();
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  const { error } = await supabase
    .from("conversations")
    .insert({ id, kind: "pet", pet_id: petId, adopter_id: userId, title: `Interesse em ${petName}` });
  if (error) throw error;
  return id;
}

export async function openSupportChat(userId: string) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("kind", "support")
    .eq("adopter_id", userId)
    .maybeSingle();
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  const { error } = await supabase
    .from("conversations")
    .insert({ id, kind: "support", adopter_id: userId, title: "Suporte Carita's Pets" });
  if (error) throw error;
  return id;
}
