/** Shared event for opening/closing the Auricrux assistant drawer from nav. */
export const AURICRUX_ASSISTANT_TOGGLE = "auricrux-assistant-toggle";
export const AURICRUX_ASSISTANT_OPEN = "auricrux-assistant-open";
export const AURICRUX_ASSISTANT_CLOSE = "auricrux-assistant-close";

export function toggleAuricruxAssistant() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AURICRUX_ASSISTANT_TOGGLE));
}

export function openAuricruxAssistant() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AURICRUX_ASSISTANT_OPEN));
}

export function closeAuricruxAssistant() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AURICRUX_ASSISTANT_CLOSE));
}
