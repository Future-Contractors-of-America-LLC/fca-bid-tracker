import { useCallback, useEffect, useRef, useState } from "react";

const PREFERRED_VOICES = [
  "Microsoft Guy Online",
  "Microsoft David Online",
  "Google UK English Male",
  "Daniel",
  "Alex",
  "Tom",
];

export const SPEECH_TIER_PARAMS = {
  1: { rate: 0.88, pitch: 0.86, label: "Apprentice instructor" },
  2: { rate: 0.91, pitch: 0.89, label: "Journeyman practitioner" },
  3: { rate: 0.94, pitch: 0.91, label: "Field foreman" },
  4: { rate: 0.96, pitch: 0.93, label: "Project superintendent" },
  5: { rate: 0.98, pitch: 0.95, label: "Executive construction operator" },
};

const LANE_TIER_BASE = {
  apprenticeship: 0,
  professional: 0.8,
  certification: 1.2,
  degree: 1.4,
  licensure: 1.6,
};

function clampTier(tier) {
  const value = Number(tier);
  if (!Number.isFinite(value)) return 3;
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function ttsParamsForTier(tier) {
  const safeTier = clampTier(tier);
  const { rate, pitch } = SPEECH_TIER_PARAMS[safeTier];
  return { rate, pitch, tier: safeTier, label: SPEECH_TIER_PARAMS[safeTier].label };
}

export function resolveSpeechTierFromContext({
  lane = "professional",
  programLevel = 1,
  moduleNumber = 1,
  lessonIndex = 1,
  completedModules = 0,
} = {}) {
  const level = Math.max(1, Number(programLevel) || 1);
  const moduleNum = Math.max(1, Number(moduleNumber) || 1);
  const lessonNum = Math.max(1, Number(lessonIndex) || 1);
  const completed = Math.max(0, Number(completedModules) || 0);

  const laneBase = LANE_TIER_BASE[lane] ?? 0.8;
  const levelScore = (Math.min(level - 1, 9) / 9) * 2.2;
  const moduleScore = (Math.min(moduleNum - 1, 11) / 11) * 1.6;
  const lessonScore = (Math.min(lessonNum - 1, 5) / 5) * 0.8;
  const completedScore = (Math.min(completed, 24) / 24) * 0.9;
  const score = laneBase + levelScore + moduleScore + lessonScore + completedScore;

  if (score < 1.8) return 1;
  if (score < 3.2) return 2;
  if (score < 4.6) return 3;
  if (score < 6) return 4;
  return 5;
}

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
    (text, options = {}) => {
      const cleaned = (text || "").trim();
      if (!cleaned || typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve(false);

      const tierParams = options.tier != null ? ttsParamsForTier(options.tier) : null;
      const rate = options.rate ?? tierParams?.rate ?? 0.94;
      const pitch = options.pitch ?? tierParams?.pitch ?? 0.92;

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

  return { supported, speaking, speak, stop, ttsParamsForTier, resolveSpeechTierFromContext };
}
