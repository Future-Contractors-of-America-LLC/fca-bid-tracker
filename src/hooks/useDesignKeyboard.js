import { useEffect } from "react";

const SHORTCUTS = {
  v: "select",
  h: "pan",
  p: "pen",
  c: "cloud",
  d: "dimension",
  k: "callout",
  u: "punch",
  n: "count",
};

export default function useDesignKeyboard({ onToolChange, onTakeoff, onExport, enabled = true }) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    function handleKeyDown(event) {
      if (event.target?.tagName === "INPUT" || event.target?.tagName === "TEXTAREA") return;
      const key = event.key.toLowerCase();
      if (SHORTCUTS[key]) {
        event.preventDefault();
        onToolChange?.(SHORTCUTS[key]);
      }
      if (key === "t" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onTakeoff?.();
      }
      if (key === "e" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onExport?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onToolChange, onTakeoff, onExport]);
}
