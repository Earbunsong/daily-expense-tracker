export type Currency = "USD" | "KHR";

export const CURRENCIES: { code: Currency; symbol: string; name: string; flag: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "KHR", symbol: "៛", name: "Khmer Riel", flag: "🇰🇭" },
];

export function formatCurrency(amount: number, currency: Currency | string): string {
  if (currency === "KHR") {
    return `${Math.round(amount).toLocaleString("en-US")} ៛`;
  }
  return `$${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currency: Currency | string): string {
  return currency === "KHR" ? "៛" : "$";
}

export function getCurrencyStep(currency: Currency | string): string {
  return currency === "KHR" ? "1" : "0.01";
}

export function getCurrencyMin(currency: Currency | string): string {
  return currency === "KHR" ? "100" : "0.01";
}
