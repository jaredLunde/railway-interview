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
      options?: Intl.NumberFormatOptions,
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
      } = { currency: "USD" },
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
      options?: Intl.NumberFormatOptions,
    ): string {
      options = typeof plural === "string" ? options : plural;
      const pluralRules = new Intl.PluralRules(locale);
      const grammaticalNumber = pluralRules.select(value);
      const formattedCount = new Intl.NumberFormat(locale, options).format(
        value,
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
     * Enable plural-sensitive message formatting using the current locale.
     *
     * @param value
     * @param options
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
     */
    pluralRules(
      value: number,
      options?: Intl.PluralRulesOptions,
    ): Intl.LDMLPluralRule {
      return new Intl.PluralRules(locale, options).select(value);
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
      options?: Intl.RelativeTimeFormatOptions,
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
      options: Intl.CollatorOptions = {},
    ): (a: T, b: T) => number {
      return new Intl.Collator(locale, options).compare;
    },

    /**
     * Formats a number of milliseconds into a locale-aware, human-readable string
     * using `Intl.NumberFormat`.
     *
     * @param value - The number of milliseconds to format.
     * @param options - The options to use from `Intl.NumberFormat` when formatting.
     */
    duration(
      value: number,
      options: Pick<Intl.NumberFormatOptions, "unitDisplay"> = {},
    ): string {
      const years = Math.floor(value / 31536000000);
      const months = Math.floor((value % 31536000000) / 2592000000);
      const days = Math.floor((value % 2592000000) / 86400000);
      const hours = Math.floor((value % 86400000) / 3600000);
      const minutes = Math.floor((value % 3600000) / 60000);
      const seconds = Math.floor((value % 60000) / 1000);
      const milliseconds = Math.floor(value % 1000);

      const parts = [];

      if (years) {
        parts.push(
          this.number(years, {
            style: "unit",
            unit: "year",
            ...options,
          }),
        );
      }

      if (months) {
        parts.push(
          this.number(months, {
            style: "unit",
            unit: "month",
            ...options,
          }),
        );
      }

      if (days) {
        parts.push(
          this.number(days, {
            style: "unit",
            unit: "day",
            ...options,
          }),
        );
      }

      if (hours && !days) {
        parts.push(
          this.number(hours, {
            style: "unit",
            unit: "hour",
            ...options,
          }),
        );
      }

      if (minutes && !days && !years && !months) {
        parts.push(
          this.number(minutes, {
            style: "unit",
            unit: "minute",
            ...options,
          }),
        );
      }

      if (seconds && !hours) {
        parts.push(
          this.number(seconds, {
            style: "unit",
            unit: "second",
            ...options,
          }),
        );
      }

      if (!parts.length) {
        parts.push(
          this.number(milliseconds, {
            style: "unit",
            unit: "millisecond",
            ...options,
          }),
        );
      }

      return parts.join(" ");
    },
  };
}
