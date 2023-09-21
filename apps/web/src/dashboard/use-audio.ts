import React from "react";

export function useAudio(file: string) {
  const audio = React.useMemo(() => new Audio(file), [file]);
  return audio;
}
