import { useCallback, useEffect, useRef, useState } from "react";

const PREFERRED_VOICES = [
  "Microsoft Guy Online",
  "Microsoft David Online",
  "Google UK English Male",
  "Daniel",
  "Alex",
  "Tom",
];

function pickVoice(voices) {
  if (!voices?.length) return null;
  for (const name of PREFERRED_VOICES) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }
  return (
    voices.find((v) => v.lang?.startsWith("en") && !v.name.toLowerCase().includes("female")) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    voices[0]
  );
}

export default function useAuricruxVoice() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    setSupported("speechSynthesis" in window);

    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current = pickVoice(voices);
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text, { rate = 0.94, pitch = 0.92 } = {}) => {
      const cleaned = (text || "").trim();
      if (!cleaned || typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve(false);

      stop();

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.rate = rate;
        utterance.pitch = pitch;
        if (voiceRef.current) utterance.voice = voiceRef.current;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => {
          setSpeaking(false);
          resolve(true);
        };
        utterance.onerror = () => {
          setSpeaking(false);
          resolve(false);
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [stop],
  );

  return { supported, speaking, speak, stop };
}
