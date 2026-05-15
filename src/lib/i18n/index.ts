import id from "./dictionaries/id.json";
import en from "./dictionaries/en.json";

export type Locale = "id" | "en";

const dictionaries: Record<Locale, Record<string, string>> = { id, en };

export function t(key: string, locale: Locale = "id"): string {
  return dictionaries[locale]?.[key] ?? dictionaries["id"]?.[key] ?? key;
}
