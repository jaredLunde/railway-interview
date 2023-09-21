import { useIntl } from "./use-intl";

/**
 * A component that renders an accessible and machine-readable relative time.
 */
export function RelativeTime({
  children,
  fallback,
  format,
  ...props
}: RelativeTimeProps) {
  const intl = useIntl();

  return (
    children
      ? (
        <time
          dateTime={children.toISOString()}
          title={children.toLocaleString()}
          {...props}
        >
          {intl.relativeTime(children, { style: format })}
        </time>
      )
      : fallback
  );
}

export function relativeTime(
  date: Date,
  options: RelativeTimeOptions = {},
): string {
  const { style: length = "long", locale = "en-US" } = options;
  const rtf = new Intl.RelativeTimeFormat(locale, {
    style: length,
    numeric: "auto",
  });
  let delta = (date.getTime() - Date.now()) / 1000;

  for (let i = 0; i <= units.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const unit = units[i]!;
    delta = Math.round(delta);

    if (Math.abs(delta) < unit.amount) {
      return rtf.format(delta, unit.name);
    }

    delta /= unit.amount;
  }

  return "";
}

const units = [
  { amount: 60, name: "second" },
  { amount: 60, name: "minute" },
  { amount: 24, name: "hour" },
  { amount: 7, name: "day" },
  { amount: Math.floor(52 / 12), name: "week" },
  { amount: 12, name: "month" },
  { amount: Number.POSITIVE_INFINITY, name: "year" },
] as const;

export type RelativeTimeOptions = {
  /**
   * The length of the internationalized message.
   *
   * @default "long"
   */
  style?: Intl.RelativeTimeFormatOptions["style"];
  /**
   * The locale to use when formatting the date.
   *
   * @default "en-US"
   */
  locale?: string;
};

export type RelativeTimeProps =
  & Omit<
    React.ComponentPropsWithoutRef<"time">,
    "dateTime" | "children"
  >
  & {
    /**
     * The length of the relative time.
     *
     * @default "long"
     */
    format?: RelativeTimeOptions["style"];
    /**
     * A fallback to render when the date is undefined.
     */
    fallback?: React.ReactNode;
    /**
     * The date to render.
     */
    children?: Date | null;
  };
