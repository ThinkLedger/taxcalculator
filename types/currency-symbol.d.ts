declare module "currency-symbol" {
  interface CurrencySymbol {
    all(): Record<string, string>;
    symbol(name: string): string;
  }

  const currencySymbol: CurrencySymbol;
  export default currencySymbol;
}

