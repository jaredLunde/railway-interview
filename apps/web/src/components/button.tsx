import clsx from "clsx";
import React from "react";
import { Spinner } from "./spinner";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    variant?: keyof typeof buttonVariants;
  }
>(
  ({ variant = "solid", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants[variant], className)}
        {...props}
      />
    );
  },
);

export const AwaitButton = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<"button">, "onClick"> & {
    variant?: keyof typeof buttonVariants;
    loadingText: React.ReactNode;
    onClick: () => Promise<any>;
  }
>(({ loadingText, children, ...props }, ref) => {
  const [status, setStatus] = React.useState<"idle" | "pending">("idle");
  return (
    <Button
      {...props}
      ref={ref}
      disabled={status === "pending"}
      onClick={() => {
        setStatus("pending");

        props.onClick().then(() => {
          setStatus("idle");
        }).catch(() => {
          setStatus("idle");
        });
      }}
    >
      {status === "pending"
        ? <Spinner className="h-[1em]">{loadingText}</Spinner>
        : children}
    </Button>
  );
});

export const buttonVariants = {
  ghost: clsx(
    "text-sm inline-flex items-center border border-transparent gap-2 text-center justify-center rounded-md font-semibold px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800",
  ),
  solid: clsx(
    "rounded-md border border-transparent inline-flex items-center gap-2 text-center justify-center bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
  ),
  danger: clsx(
    "rounded-md border border-transparent inline-flex items-center gap-2 text-center justify-center bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
  ),
  outline: clsx(
    "rounded-md border border-slate-700/80 inline-flex items-center gap-2 text-center justify-center px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
  ),
};
