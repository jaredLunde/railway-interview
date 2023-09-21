import clsx from "clsx";
import React from "react";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label">
>((props, ref) => {
  return (
    <label
      {...props}
      ref={ref}
      className={clsx("text-base text-slate-200", props.className)}
    />
  );
});
