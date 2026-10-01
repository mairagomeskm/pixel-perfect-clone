import { useEffect, useRef, useState } from "react";

export const DRAFT_LABELS: Record<string, string> = {
  "draft:pet": "um cadastro de pet",
  "draft:campaign": "uma vaquinha",
  "draft:census": "seu censo de adotante",
};

export function hasDraft(key: string) {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(key);
}
export function clearDraft(key: string) {
  localStorage.removeItem(key);
}

/** Salva automaticamente o formulário no navegador a cada alteração. */
export function useDraft<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [, tick] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        setValue({ ...initial, ...d.value });
        setSavedAt(d.at);
      } catch {}
    }
    loaded.current = true;
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (patch: Partial<T>) => {
    setValue((v) => {
      const nv = { ...v, ...patch };
      const at = Date.now();
      localStorage.setItem(key, JSON.stringify({ value: nv, at }));
      setSavedAt(at);
      return nv;
    });
  };

  const reset = (v: T = initial) => {
    clearDraft(key);
    setSavedAt(null);
    setValue(v);
  };

  const label = savedAt
    ? (() => {
        const m = Math.floor((Date.now() - savedAt) / 60000);
        return m < 1 ? "Última alteração salva agora há pouco" : `Última alteração salva há ${m} minuto${m > 1 ? "s" : ""}`;
      })()
    : null;

  return { value, update, reset, savedLabel: label, setValue };
}
