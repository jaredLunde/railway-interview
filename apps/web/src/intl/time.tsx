import { useIntl } from "./use-intl";

/**
 * A component that renders an accessible and machine-readable date and time.
 */
export function Time({
  children,
  fallback,
  dateFormat = "medium",
  timeFormat = "short",
  dayFormat,
  timeZone,
  ...props
}: TimeProps) {
  const intl = useIntl();

  return (
    children
      ? (
        <time
          dateTime={children.toISOString()}
          title={children.toLocaleString()}
          {...props}
        >
          {intl.date(children, {
            dateStyle: dateFormat || undefined,
            timeStyle: timeFormat || undefined,
            dayPeriod: dayFormat,
            timeZone,
          })}
        </time>
      )
      : fallback
  );
}

export type TimeProps =
  & Omit<
    React.ComponentPropsWithoutRef<"time">,
    "dateTime" | "children"
  >
  & {
    /**
     * The length of the time.
     *
     * @default "short"
     */
    dateFormat?: Intl.DateTimeFormatOptions["dateStyle"] | false;
    /**
     * The length of the time.
     *
     * @default "short"
     */
    timeFormat?: Intl.DateTimeFormatOptions["timeStyle"] | false;
    /**
     * The formatting length used for day periods like "in the morning", "am", "noon", "n" etc.
     */
    dayFormat?: Intl.DateTimeFormatOptions["dayPeriod"];
    /**
     * The time zone to use for formatting.
     */
    timeZone?: Intl.DateTimeFormatOptions["timeZone"];
    /**
     * A fallback to render when the date is undefined.
     */
    fallback?: React.ReactNode;
    /**
     * The date to render.
     */
    children?: Date | null;
  };
