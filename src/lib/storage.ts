import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

const ext = (f: File | Blob, fallback: string) =>
  f instanceof File && f.name.includes(".") ? f.name.split(".").pop() : fallback;

/** Envia uma foto pública (pets, vaquinhas, diário) e devolve um link de longa duração. */
export async function uploadMedia(userId: string, file: File) {
  const path = `${userId}/${crypto.randomUUID()}.${ext(file, "jpg")}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (e2) throw e2;
  return data.signedUrl;
}

export async function uploadChatFile(conversationId: string, file: File | Blob, fallbackExt: string) {
  const path = `${conversationId}/${crypto.randomUUID()}.${ext(file, fallbackExt)}`;
  const { error } = await supabase.storage.from("chat-attachments").upload(path, file, {
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

export async function signedUrl(bucket: string, path: string) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
