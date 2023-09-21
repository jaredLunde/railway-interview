import clsx from "clsx";
import React from "react";

/**
 * A loading spinner component with color and size options.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    { className, style, size = "1em", children, ...props },
    ref,
  ): React.ReactElement {
    const spinner = (
      <span
        className={clsx(
          "relative inline-block h-[1em] w-[1em] animate-spinner align-middle",
          className,
        )}
        ref={ref}
        style={{ ...style, fontSize: size }}
        aria-label="Loading..."
        {...props}
      >
        <span
          className={spinnerWheels}
          style={{
            borderWidth: "max(2px, 0.125em)",
            borderStyle: "solid",
            borderColor:
              "currentColor color-mix(in srgb, currentColor 40%, transparent) color-mix(in srgb, currentColor 40%, transparent)",
          }}
        />
      </span>
    );

    if (children) {
      return (
        <span className="inline-grid grid-cols-grow-l items-center gap-[1ch]">
          <span>{children}</span>
          {spinner}
        </span>
      );
    }

    return spinner;
  },
);

const spinnerWheels = clsx("absolute block h-[1em] w-[1em] rounded-[50%]");

export type SpinnerProps =
  & Omit<
    React.HTMLAttributes<HTMLSpanElement>,
    "color"
  >
  & {
    /**
     * Sets the `width` and `height` of the spinner
     *
     * @default "1em"
     */
    size?: React.CSSProperties["fontSize"];
    /**
     * Text to display alongside the spinner
     */
    children?: React.ReactNode;
  };
