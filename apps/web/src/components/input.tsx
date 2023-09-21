import React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(
  (props, ref) => {
    return (
      <div className="flex rounded-md shadow-sm ring-1 bg-slate-800/60 ring-inset ring-slate-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
        <input
          ref={ref}
          type="text"
          className="block bg-transparent flex-1 border-0 py-1.5 px-2 text-slate-100 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
          {...props}
        />
      </div>
    );
  },
);
