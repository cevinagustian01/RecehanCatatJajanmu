export const CATEGORIES = [
  { value: "food", label: "🍔 Food" },
  { value: "transport", label: "🚗 Transport" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "bills", label: "💡 Bills" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "health", label: "💊 Health" },
  { value: "salary", label: "💰 Salary" },
  { value: "freelance", label: "💻 Freelance" },
  { value: "investment", label: "📈 Investment" },
  { value: "others", label: "📦 Others" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function getCategoryLabel(value: string): string {
  const found = CATEGORIES.find(c => c.value === value.toLowerCase());
  return found ? found.label : value;
}
