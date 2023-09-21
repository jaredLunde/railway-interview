import { relativeTime, type RelativeTimeOptions } from "./relative-time";

/**
 * A hook that returns formatters for the current locale.
 *
 * @example
 * ```tsx
 * const intl = useIntl();
 *
 * return (
 *  <div>
 *   {intl.date(new Date())}
 * </div>
 * ```
 */
export function useIntl() {
  const locale = window.navigator.language;

  return {
    /**
     * Format a date using the current locale. In general, you should prefer
     * to use the `Time` component instead of this function because it
     * guarantees that the formatting will be accessible to screen readers.
     */
    date(date: Date, options?: Intl.DateTimeFormatOptions): string {
      return new Intl.DateTimeFormat(locale, options).format(date);
    },

    /**
     * Format a number using the current locale.
     *
     * @param value
     * @param options
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
     */
    number(value: number, options?: Intl.NumberFormatOptions): string {
      return new Intl.NumberFormat(locale, options).format(value);
    },

    /**
     * Format a range of numbers using the current locale.
     *
     * @param start
     * @param end
     * @param options
     */
    range(
      start: number,
      end: number,
      options?: Intl.NumberFormatOptions
    ): string {
      return new Intl.NumberFormat(locale, options).formatRange(start, end);
    },

    /**
     * Format a currency using the current locale.
     *
     * @param value
     * @param options
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
     */
    currency(
      value: number,
      options: Omit<Intl.NumberFormatOptions, "currency"> & {
        currency: string;
      } = { currency: "USD" }
    ): string {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        ...options,
      }).format(value);
    },

    /**
     * Format a plural-sensitive message using the current locale.
     *
     * @param value
     * @param options
     * @param singular
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
     */
    plural(
      value: number,
      singular: string,
      plural?: string | Intl.NumberFormatOptions,
      options?: Intl.NumberFormatOptions
    ): string {
      options = typeof plural === "string" ? options : plural;
      const pluralRules = new Intl.PluralRules(locale);
      const grammaticalNumber = pluralRules.select(value);
      const formattedCount = new Intl.NumberFormat(locale, options).format(
        value
      );

      return `${formattedCount} ${
        grammaticalNumber === "one"
          ? singular
          : typeof plural === "string"
          ? plural
          : singular + "s"
      }`;
    },

    /**
     * Format a relative time using the current locale. In general, you should prefer
     * to use the `RelativeTime` component instead of this function because it guarantees
     * that the formatting will be accessible to screen readers.
     *
     * @param date
     * @param options
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RelativeTimeFormat
     */
    relativeTime(value: Date, options?: Omit<RelativeTimeOptions, "locale">) {
      return relativeTime(value, { locale, ...options });
    },

    /**
     * Enable a relative time formatting using the current locale.
     *
     * @param value
     * @param unit
     * @param options
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RelativeTimeFormat
     */
    relativeTimeFormat(
      value: number,
      unit: Intl.RelativeTimeFormatUnit,
      options?: Intl.RelativeTimeFormatOptions
    ): string {
      return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
    },

    /**
     * Format a list of items using the current locale.
     *
     * @param values
     * @param options
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat
     */
    list(values: string[], options?: Intl.ListFormatOptions): string {
      return new Intl.ListFormat(locale, options).format(values);
    },

    /**
     * Enable language-sensitive string comparison using the current locale.
     *
     * @param options
     */
    compare<T extends string>(
      options: Intl.CollatorOptions = {}
    ): (a: T, b: T) => number {
      return new Intl.Collator(locale, options).compare;
    },
  };
}
